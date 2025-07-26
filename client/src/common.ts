interface User {
  userUID: string;
  email: string;
}

interface DropdownOption {
  id: string;
  value: string;
}

export const makeUserDropdownData = (data: unknown): DropdownOption[] => {
  // Check if data is an array
  if (!Array.isArray(data)) {
    console.warn('makeUserDropdownData: Input is not an array');
    return [];
  }

  // Filter out any invalid entries and ensure type safety
  const validUsers = data.filter((item): item is User => {
    return (
      item &&
      typeof item === 'object' &&
      'userUID' in item &&
      'email' in item &&
      typeof item.userUID === 'string' &&
      typeof item.email === 'string'
    );
  });

  if (validUsers.length === 0) {
    return [];
  }

  const notAssignedUser: User = { userUID: '1822', email: 'Not Assigned' };

  // Check if "Not Assigned" entry already exists
  const exists = validUsers.some(
    (user) => user.userUID === notAssignedUser.userUID
  );

  // Create a new array instead of modifying the input
  const usersWithNotAssigned = exists
    ? validUsers
    : [notAssignedUser, ...validUsers];

  return usersWithNotAssigned.map(
    (user): DropdownOption => ({
      id: user.userUID,
      value: user.email,
    })
  );
};
