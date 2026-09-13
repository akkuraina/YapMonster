import React, { useEffect } from "react";
import {
  useTracks,
  VideoTrack,
  TrackRefContextIfNeeded,
  ControlBar,
  useLocalParticipant,
  useRoomContext,
  RoomAudioRenderer,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { Box, Flex, Text, Icon } from "@chakra-ui/react";
import { FaVideoSlash } from "react-icons/fa";

/**
 * A single video tile — same structure for local and remote.
 * Uses aspect-ratio: 16/9 + object-fit: contain as the single source of truth
 * for sizing. No conditional styles between local and remote.
 */
const VideoTile = ({ trackRef, isLocal }) => {
  // Local tracks don't need subscription; remote tracks do
  const isCameraOff =
    !trackRef ||
    trackRef.publication?.isMuted ||
    (!isLocal && !trackRef.publication?.isSubscribed);

  return (
    <Box
      position="relative"
      w="100%"
      style={{ aspectRatio: "16/9" }}
      bg="#0a0f1e"
      borderRadius="14px"
      overflow="hidden"
      border="1px solid rgba(255,255,255,0.1)"
      boxShadow="0 8px 32px rgba(0,0,0,0.5)"
      sx={{
        "& video": {
          objectFit: "contain !important",
          objectPosition: "center",
          width: "100% !important",
          height: "100% !important",
          background: "#0a0f1e",
          transform: isLocal ? "rotateY(180deg)" : "none",
        },
      }}
    >
      {/* Camera-Off fallback — distinct from broken/blank state */}
      {isCameraOff && (
        <Flex
          position="absolute"
          inset={0}
          direction="column"
          align="center"
          justify="center"
          bg="#0a0f1e"
          zIndex={2}
          gap={2}
        >
          <Icon as={FaVideoSlash} color="whiteAlpha.400" boxSize={8} />
          <Text fontSize="xs" color="whiteAlpha.500" fontWeight="600">
            {isLocal ? "Your camera is off" : "Camera off"}
          </Text>
        </Flex>
      )}

      {trackRef && !isCameraOff && (
        <TrackRefContextIfNeeded trackRef={trackRef}>
          <VideoTrack
            trackRef={trackRef}
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </TrackRefContextIfNeeded>
      )}

      {/* Name badge */}
      <Box
        position="absolute"
        bottom={2}
        left={2}
        bg="rgba(0,0,0,0.6)"
        backdropFilter="blur(8px)"
        px={2}
        py={1}
        borderRadius="8px"
        zIndex={3}
      >
        <Text fontSize="2xs" color="white" fontWeight="700">
          {isLocal ? "You" : trackRef?.participant?.name || "Participant"}
        </Text>
      </Box>
    </Box>
  );
};

/**
 * Custom room layout that replaces <VideoConference />.
 * Builds the grid manually so we control:
 * 1. Tile structure (no key-change re-mounts)
 * 2. CSS (one place, same for local and remote)
 * 3. Camera-off fallback vs. broken blank state
 */
const CustomVideoRoom = () => {
  const cameraTracks = useTracks([Track.Source.Camera]);
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();

  const localTrack = cameraTracks.find(
    (t) => t.participant?.identity === localParticipant?.identity
  );
  const remoteTracks = cameraTracks.filter(
    (t) => t.participant?.identity !== localParticipant?.identity
  );

  // ─── Diagnostic: log every time track list changes ───────────────────────
  useEffect(() => {
    console.group("%c[YM CustomVideoRoom] useTracks snapshot", "color:#0ea5e9;font-weight:bold");
    console.log("[TRACKS] all camera tracks:", cameraTracks.map((t) => ({
      identity: t.participant?.identity,
      isLocal: t.participant?.identity === localParticipant?.identity,
      source: t.source,
      hasPub: !!t.publication,
      pubSid: t.publication?.trackSid,
      isMuted: t.publication?.isMuted,
      isSubscribed: t.publication?.isSubscribed,
      trackKind: t.publication?.track?.kind,
      trackReadyState: t.publication?.track?.mediaStreamTrack?.readyState,
      trackEnabled: t.publication?.track?.mediaStreamTrack?.enabled,
    })));
    console.log("[TRACKS] localTrack resolved:", localTrack
      ? { identity: localTrack.participant?.identity, pubSid: localTrack.publication?.trackSid, isMuted: localTrack.publication?.isMuted }
      : "NONE (local camera not in useTracks array)"
    );
    console.log("[TRACKS] remote tracks count:", remoteTracks.length);
    console.groupEnd();
  // eslint-disable-next-line
  }, [cameraTracks.length, localTrack?.publication?.trackSid, localTrack?.publication?.isMuted]);

  // ─── Diagnostic: room-level event listeners ───────────────────────────────
  useEffect(() => {
    if (!room) return;
    const onLocalPublished = (pub, participant) => {
      console.log("%c[LK ROOM] localTrackPublished", "color:green;font-weight:bold", {
        source: pub.source,
        trackSid: pub.trackSid,
        isMuted: pub.isMuted,
        participantIdentity: participant?.identity,
        trackReadyState: pub.track?.mediaStreamTrack?.readyState,
      });
    };
    const onLocalUnpublished = (pub, participant) => {
      console.log("%c[LK ROOM] localTrackUnpublished", "color:orange", {
        source: pub.source,
        trackSid: pub.trackSid,
        participantIdentity: participant?.identity,
      });
    };
    const onLocalMuted = (pub) => {
      console.log("[LK ROOM] localTrackMuted →", pub.source, { trackSid: pub.trackSid });
    };
    const onLocalUnmuted = (pub) => {
      console.log("[LK ROOM] localTrackUnmuted →", pub.source, { trackSid: pub.trackSid });
    };
    const onMediaError = (err) => {
      console.error("%c[LK ROOM] mediaDevicesError", "color:red;font-weight:bold", {
        name: err.name,
        message: err.message,
        constraint: err.constraint,
      });
    };

    room.on("localTrackPublished", onLocalPublished);
    room.on("localTrackUnpublished", onLocalUnpublished);
    room.on("trackMuted", onLocalMuted);
    room.on("trackUnmuted", onLocalUnmuted);
    room.on("mediaDevicesError", onMediaError);

    return () => {
      room.off("localTrackPublished", onLocalPublished);
      room.off("localTrackUnpublished", onLocalUnpublished);
      room.off("trackMuted", onLocalMuted);
      room.off("trackUnmuted", onLocalUnmuted);
      room.off("mediaDevicesError", onMediaError);
    };
  }, [room]);

  const totalParticipants = remoteTracks.length + (localTrack ? 1 : 0);
  const isOneOnOne = totalParticipants <= 2;

  return (
    <Flex direction="column" h="100%" bg="#070d1e">
      {/* LiveKit Room Audio Renderer for hearing remote participants */}
      <RoomAudioRenderer />

      {/* Video Area */}
      <Box flex="1" minH="0" overflow="hidden" p={3}>
        {isOneOnOne ? (
          /* 1-on-1: side-by-side equal tiles */
          <Flex
            h="100%"
            gap={3}
            align="center"
            justify="center"
            direction={{ base: "column", md: "row" }}
          >
            {/* Local tile */}
            <Box flex="1" minW="0" minH="0">
              <VideoTile trackRef={localTrack || null} isLocal={true} />
            </Box>

            {/* Remote tile(s) */}
            {remoteTracks.length === 0 ? (
              <Box flex="1" minW="0" minH="0">
                <Flex
                  style={{ aspectRatio: "16/9" }}
                  bg="#0a0f1e"
                  borderRadius="14px"
                  border="1px solid rgba(255,255,255,0.08)"
                  align="center"
                  justify="center"
                  direction="column"
                  gap={2}
                >
                  <Icon as={FaVideoSlash} color="whiteAlpha.300" boxSize={8} />
                  <Text fontSize="xs" color="whiteAlpha.400" fontWeight="600">
                    Waiting for others to join...
                  </Text>
                </Flex>
              </Box>
            ) : (
              remoteTracks.map((t) => (
                <Box key={t.participant?.identity} flex="1" minW="0" minH="0">
                  <VideoTile trackRef={t} isLocal={false} />
                </Box>
              ))
            )}
          </Flex>
        ) : (
          /* Group: responsive grid */
          <Box
            display="grid"
            gridTemplateColumns={{
              base: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap={3}
            h="100%"
            alignContent="start"
            overflowY="auto"
          >
            {localTrack && (
              <VideoTile trackRef={localTrack} isLocal={true} />
            )}
            {remoteTracks.map((t) => (
              <VideoTile
                key={t.participant?.identity}
                trackRef={t}
                isLocal={false}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Control Bar */}
      <Box
        bg="rgba(15, 23, 42, 0.95)"
        borderTop="1px solid rgba(255, 255, 255, 0.1)"
        backdropFilter="blur(16px)"
        flexShrink={0}
      >
        <ControlBar
          variation="minimal"
          controls={{
            microphone: true,
            camera: true,
            screenShare: true,
            leave: true,
          }}
        />
      </Box>
    </Flex>
  );
};

export default CustomVideoRoom;
