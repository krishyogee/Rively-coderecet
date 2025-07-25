import { GetWorkspacesOfCustomerResponse, KeyResult } from '@/gql/generated';

// export interface KeyResult {
//   id: string;
//   text: string;
//   status: 'on-track' | 'at-risk' | 'behind' | 'completed';
//   progress: number;
// }

export interface OKRCardProps {
  id: string;
  title: string;
  timePeriod: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  keyResults: KeyResult[];
  color: string;
  // quarter: string;
  owner: string;
}

export const metricTypes = [
  {
    id: 1,
    value: 'Number',
  },
  {
    id: 2,
    value: 'Percentage',
  },
  {
    id: 3,
    value: 'Currency',
  },
  {
    id: 4,
    value: 'Boolean',
  },
];

export const workspaceDopdownData = (
  workspaces: GetWorkspacesOfCustomerResponse[]
) => {
  // make an array with id and value for rach object
  return workspaces.map((workspace) => ({
    id: workspace.Id,
    value: workspace.Name,
  }));
};

export enum KeyResultStatusID {
  ON_TRACK = 1,
  AT_RISK = 2,
  BEHIND = 3,
  COMPLETED = 4,
}

export const KeyResultStatusMap: { [key: string]: number } = {
  ON_TRACK: 1,
  AT_RISK: 2,
  BEHIND: 3,
  COMPLETED: 4,
};

export const KeyResultStatusReverseMap: { [key: number]: string } = {
  1: 'on-track',
  2: 'at-risk',
  3: 'behind',
  4: 'completed',
};

// Assuming the enum is defined as follows
export enum KeyResultUpdateFrequencyType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

// Function to convert a string to the corresponding enum value
export function convertToUpdateFrequencyType(
  frequency: string
): KeyResultUpdateFrequencyType | null {
  switch (frequency.toLowerCase()) {
    case 'Daily':
      return KeyResultUpdateFrequencyType.DAILY;
    case 'Weekly':
      return KeyResultUpdateFrequencyType.WEEKLY;
    case 'Monthly':
      return KeyResultUpdateFrequencyType.MONTHLY;
    default:
      return null; // Return null or throw an error if the input is invalid
  }
}

export const checkInStatusDropdown = () => {
  return [
    {
      id: 'ON_TRACK',
      value: 'On Track',
    },
    {
      id: 'AT_RISK',
      value: 'At Risk',
    },
    {
      id: 'BEHIND',
      value: 'Behind',
    },
    {
      id: 'COMPLETED',
      value: 'Completed',
    },
  ];
};

export const keyResultStatusDropdown = () => {
  return [
    {
      id: 1,
      value: 'On Track',
    },
    {
      id: 2,
      value: 'At Risk',
    },
    {
      id: 3,
      value: 'Behind',
    },
    {
      id: 4,
      value: 'Completed',
    },
  ];
};

export const keyResultUpdateFrequencyDropdown = () => {
  return [
    {
      id: 'DAILY',
      value: 'Daily',
    },
    {
      id: 'WEEKLY',
      value: 'Weekly',
    },
    {
      id: 'MONTHLY',
      value: 'Monthly',
    },
  ];
};

// Assuming the enum is defined as follows
export enum KeyResultMetricType {
  NUMBER = 'NUMBER',
  PERCENTAGE = 'PERCENTAGE',
  CURRENCY = 'CURRENCY',
  BOOLEAN = 'BOOLEAN',
}

// Function to convert a string to the corresponding enum value
// export function convertToMetricType(
//   metric: string | undefined
// ): KeyResultMetricType | null {
//   switch (metric?.toUpperCase()) {
//     case 'Number':
//       return KeyResultMetricType.NUMBER;
//     case 'Percentage':
//       return KeyResultMetricType.PERCENTAGE;
//     case 'Currency':
//       return KeyResultMetricType.CURRENCY;
//     case 'Boolean':
//       return KeyResultMetricType.BOOLEAN;
//     default:
//       return undefined; // Return null or handle the error as needed
//   }
// }

export const getKeyResultStatusID = (status: string): number => {
  return KeyResultStatusMap[status] || 0; // returns 0 if not found
};

export const getKeyResultStatusString = (id: number): string => {
  return KeyResultStatusReverseMap[id] || ''; // returns empty string if not found
};

export function getQuarter(inputDate: string): string {
  const parsedDate = new Date(inputDate);
  if (isNaN(parsedDate.getTime())) {
    throw new Error('Invalid date format');
  }

  const year = parsedDate.getFullYear();
  const month = parsedDate.getMonth() + 1; // getMonth() is zero-based
  let quarter: string;

  if (month >= 1 && month <= 3) {
    quarter = 'Q1';
  } else if (month >= 4 && month <= 6) {
    quarter = 'Q2';
  } else if (month >= 7 && month <= 9) {
    quarter = 'Q3';
  } else {
    quarter = 'Q4';
  }

  return `${quarter} ${year}`;
}

export function getMetricTypes() {
  return [
    { id: KeyResultMetricType.NUMBER, value: 'Number' },
    { id: KeyResultMetricType.PERCENTAGE, value: 'Percentage' },
    { id: KeyResultMetricType.CURRENCY, value: 'Currency' },
    { id: KeyResultMetricType.BOOLEAN, value: 'Boolean' },
  ];
}

// get enum value from noraml string
export function getMetricTypeENUM(metricType: string): KeyResultMetricType {
  switch (metricType) {
    case 'Number':
      return KeyResultMetricType.NUMBER;
    case 'Percentage':
      return KeyResultMetricType.PERCENTAGE;
    case 'Currency':
      return KeyResultMetricType.CURRENCY;
    case 'Boolean':
      return KeyResultMetricType.BOOLEAN;
    default:
      return KeyResultMetricType.NUMBER;
  }
}

export function getUpdateFrequencyENUM(
  updateFrequency: string
): KeyResultUpdateFrequencyType {
  switch (updateFrequency) {
    case 'Daily':
      return KeyResultUpdateFrequencyType.DAILY;
    case 'Weekly':
      return KeyResultUpdateFrequencyType.WEEKLY;
    case 'Monthly':
      return KeyResultUpdateFrequencyType.MONTHLY;
    default:
      throw new Error(`Unknown update frequency: ${updateFrequency}`);
  }
}

export const fromUpdateFrequencyIdToString = (id: number): string => {
  if (id == 1) {
    return 'DAILY';
  } else if (id == 2) {
    return 'WEEKLY';
  } else if (id == 3) {
    return 'MONTHLY';
  } else {
    return '';
  }
};

export const getLighterShade = (color: string = '4A90E2') => {
  // console.log('color', color);
  if (color.length === 0) {
    return '#4A90E2';
  }
  // Handle different color format inputs
  const isHex = color.startsWith('#');
  const isRGB = color.startsWith('rgb');

  // Convert to RGB if hex
  let r, g, b;
  if (isHex) {
    const hex = color.replace('#', '');
    r = parseInt(hex.substr(0, 2), 16);
    g = parseInt(hex.substr(2, 2), 16);
    b = parseInt(hex.substr(4, 2), 16);
  } else if (isRGB) {
    [r, g, b] = color
      .replace('rgb(', '')
      .replace(')', '')
      .split(',')
      .map((x) => parseInt(x.trim()));
  } else {
    throw new Error('Invalid color format. Please use hex (#RRGGBB) or RGB.');
  }

  // Make color lighter by increasing RGB values
  const lightenFactor = 0.2; // Adjust this value to control how much lighter
  r = Math.min(255, Math.round(r + (255 - r) * lightenFactor));
  g = Math.min(255, Math.round(g + (255 - g) * lightenFactor));
  b = Math.min(255, Math.round(b + (255 - b) * lightenFactor));

  // Return in the same format as input
  if (isHex) {
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } else {
    return `rgb(${r}, ${g}, ${b})`;
  }
};

export function roundToTwoDecimalPlaces(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateProgress(
  startValue: number,
  currentValue: number,
  targetValue: number
): number {
  // Case 1: Target value equals start value
  if (targetValue === startValue) {
    if (currentValue === targetValue) {
      return 100; // Target reached
    }
    return 0; // No progress if currentValue is not equal to targetValue
  }

  // Case 2: Current value less than start value
  if (currentValue < startValue) {
    return 0; // No progress
  }

  // Case 3: Current value between start and target
  if (currentValue >= startValue && currentValue <= targetValue) {
    const progress =
      ((currentValue - startValue) / (targetValue - startValue)) * 100;
    return Math.min(Math.max(progress, 0), 100); // Clamp between 0% and 100%
  }

  // Case 4: Current value greater than target value
  if (currentValue > targetValue) {
    return 100; // Target exceeded
  }

  // Fallback (should not reach here)
  return 0;
}
