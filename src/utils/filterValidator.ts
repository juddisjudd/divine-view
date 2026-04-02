interface ValidationError {
  line: number;
  message: string;
  severity: "error" | "warning";
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

const NUMERIC_CONDITIONS = [
  "AreaLevel",
  "ItemLevel",
  "DropLevel",
  "Quality",
  "Sockets",
  "LinkedSockets",
  "Height",
  "Width",
  "MapTier",
  "GemLevel",
  "StackSize",
  "WaystoneTier",
  "EnchantmentPassiveNum",
  "CorruptedMods",
  "BaseEvasion",
  "BaseArmour",
  "BaseEnergyShield",
] as const;

// All known condition keywords — used to detect that a block has conditions
const ALL_CONDITIONS = [
  ...NUMERIC_CONDITIONS,
  "Class",
  "BaseType",
  "Rarity",
  "SocketGroup",
  "HasExplicitMod",
  "HasImplicitMod",
  "HasEnchantment",
  "AnyEnchantment",
  "Identified",
  "Corrupted",
  "Mirrored",
  "ElderItem",
  "ShaperItem",
  "HasInfluence",
  "FracturedItem",
  "SynthesisedItem",
  "TwiceCorrupted",
  "HasCruciblePassiveTree",
  "AlternateQuality",
];

const OPERATORS = ["=", "==", ">", "<", ">=", "<="] as const;

const COLOR_COMMANDS = [
  "SetTextColor",
  "SetBorderColor",
  "SetBackgroundColor",
] as const;

const VALID_EFFECT_COLORS = [
  "Red",
  "Green",
  "Blue",
  "Brown",
  "White",
  "Yellow",
  "Cyan",
  "Grey",
  "Orange",
  "Pink",
  "Purple",
] as const;

// All known action keywords — lines starting with these are valid inside blocks
const KNOWN_ACTIONS = [
  ...COLOR_COMMANDS,
  "SetFontSize",
  "PlayEffect",
  "PlayAlertSound",
  "PlayAlertSoundPositional",
  "CustomAlertSound",
  "CustomAlertSoundOptional",
  "MinimapIcon",
  "DisableDropSound",
  "EnableDropSound",
];

const validateOperator = (operator: string): boolean =>
  OPERATORS.includes(operator as (typeof OPERATORS)[number]);

const validateFilterLine = (
  line: string,
  lineNumber: number
): ValidationError[] => {
  const errors: ValidationError[] = [];
  // Strip inline comments before validating
  const trimmedLine = line.split("#")[0].trim();

  if (!trimmedLine) return errors;

  for (const condition of NUMERIC_CONDITIONS) {
    if (trimmedLine.startsWith(condition + " ") || trimmedLine === condition) {
      const parts = trimmedLine.split(/\s+/);

      // Operator is optional — "GemLevel 19" is valid shorthand for "GemLevel >= 19"
      const hasOperator = parts.length >= 2 && validateOperator(parts[1]);
      const valueStr = hasOperator ? parts[2] : parts[1];
      const valueIndex = hasOperator ? 2 : 1;

      if (!valueStr) {
        errors.push({
          line: lineNumber,
          message: `${condition} requires a value`,
          severity: "error",
        });
        return errors;
      }

      if (hasOperator && !validateOperator(parts[1])) {
        errors.push({
          line: lineNumber,
          message: `Invalid operator "${parts[1]}" for ${condition}`,
          severity: "error",
        });
      }

      const value = parseInt(valueStr);
      if (isNaN(value) || value < 0) {
        errors.push({
          line: lineNumber,
          message: `${condition} requires a non-negative numeric value`,
          severity: "error",
        });
      }

      return errors;
    }
  }

  if (COLOR_COMMANDS.some((cmd) => trimmedLine.startsWith(cmd + " ") || trimmedLine === cmd)) {
    const parts = trimmedLine.split(/\s+/);
    const colorValues = parts.slice(1);

    colorValues.forEach((value, index) => {
      const num = parseInt(value);
      if (isNaN(num) || num < 0 || num > 255) {
        errors.push({
          line: lineNumber,
          message: `Invalid color value "${value}" at position ${index + 1}. Must be 0–255`,
          severity: "error",
        });
      }
    });

    if (colorValues.length < 3 || colorValues.length > 4) {
      errors.push({
        line: lineNumber,
        message: "Color commands require 3 or 4 values (R G B [A])",
        severity: "error",
      });
    }

    return errors;
  }

  if (trimmedLine.startsWith("SetFontSize")) {
    const parts = trimmedLine.split(/\s+/);
    const size = parseInt(parts[1]);
    if (isNaN(size) || size < 18 || size > 45) {
      errors.push({
        line: lineNumber,
        message: "SetFontSize must be between 18 and 45",
        severity: "error",
      });
    }
    return errors;
  }

  if (trimmedLine.startsWith("PlayEffect")) {
    const parts = trimmedLine.split(/\s+/);
    const color = parts[1];
    // "Temp" suffix is valid: PlayEffect Orange Temp
    if (color && !VALID_EFFECT_COLORS.includes(color as (typeof VALID_EFFECT_COLORS)[number])) {
      errors.push({
        line: lineNumber,
        message: `Invalid PlayEffect color "${color}". Must be one of: ${VALID_EFFECT_COLORS.join(", ")}`,
        severity: "error",
      });
    }
    return errors;
  }

  return errors;
};

// Determines whether a trimmed line (comment-stripped) is a block header
const isBlockHeader = (trimmedLine: string): boolean =>
  /^(Show|Hide)(\s|$)/.test(trimmedLine);

// Determines whether a line counts as a condition for the "block has conditions" check
const isConditionLine = (trimmedLine: string): boolean =>
  ALL_CONDITIONS.some(
    (cond) => trimmedLine.startsWith(cond + " ") || trimmedLine === cond
  );

// Determines whether a line is a known action (valid but not a condition)
const isKnownAction = (trimmedLine: string): boolean =>
  KNOWN_ACTIONS.some(
    (action) => trimmedLine.startsWith(action + " ") || trimmedLine === action
  );

export const validateFilter = (content: string): ValidationResult => {
  const lines = content.split("\n");
  let inBlock = false;
  let hasConditions = false;
  let blockStartLine = 0;
  let isLastBlock = false;
  const errors: ValidationError[] = [];

  // Pre-determine the line of the last Show/Hide block so we can exempt
  // intentional trailing catch-alls (a common valid pattern)
  let lastBlockLine = 0;
  lines.forEach((line, index) => {
    if (isBlockHeader(line.split("#")[0].trim())) lastBlockLine = index + 1;
  });

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.split("#")[0].trim();

    if (!trimmedLine) return;

    if (isBlockHeader(trimmedLine)) {
      if (inBlock && !hasConditions && !isLastBlock) {
        errors.push({
          line: blockStartLine,
          message: "Block has no conditions — it will match every item",
          severity: "warning",
        });
      }
      inBlock = true;
      hasConditions = false;
      blockStartLine = lineNumber;
      isLastBlock = lineNumber === lastBlockLine;
      return;
    }

    if (!inBlock) {
      errors.push({
        line: lineNumber,
        message: `"${trimmedLine.split(/\s+/)[0]}" must be inside a Show or Hide block`,
        severity: "error",
      });
      return;
    }

    if (isConditionLine(trimmedLine)) {
      hasConditions = true;
    }

    if (!isKnownAction(trimmedLine) && !isConditionLine(trimmedLine)) {
      return;
    }

    errors.push(...validateFilterLine(line, lineNumber));
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};
