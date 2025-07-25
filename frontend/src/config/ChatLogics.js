export const isSameSenderMargin = (messages, m, i, userId) => {
  // console.log(i === messages.length - 1);

  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === m.sender._id &&
    messages[i].sender._id !== userId
  )
    return 33;
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  )
    return 0;
  else return "auto";
};

export const isSameSender = (messages, m, i, userId) => {
  return (
    i < messages.length - 1 &&
    (messages[i + 1].sender._id !== m.sender._id ||
      messages[i + 1].sender._id === undefined) &&
    messages[i].sender._id !== userId
  );
};

export const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender._id
  );
};

export const isSameUser = (messages, m, i) => {
  return i > 0 && messages[i - 1].sender._id === m.sender._id;
};

export const getSender = (loggedUser, users) => {
  if (!users || !Array.isArray(users) || users.length === 0) {
    return "Unknown User";
  }
  
  if (users.length === 1) {
    return users[0]?.name || "Unknown User";
  }
  
  return users[0]?._id === loggedUser?._id 
    ? (users[1]?.name || "Unknown User") 
    : (users[0]?.name || "Unknown User");
};

export const getSenderFull = (loggedUser, users) => {
  if (!users || !Array.isArray(users) || users.length === 0) {
    return null;
  }
  
  if (users.length === 1) {
    return users[0] || null;
  }
  
  return users[0]?._id === loggedUser?._id ? users[1] : users[0];
};