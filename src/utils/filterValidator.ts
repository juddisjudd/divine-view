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
  "HasExplicitMod",
];

const COMPARISON_CONDITIONS = [
  ...NUMERIC_CONDITIONS,
  "Rarity",
  "Class",
  "BaseType",
];

const validateFilterLine = (
  line: string,
  lineNumber: number
): ValidationError[] => {
  const errors: ValidationError[] = [];
  const trimmedLine = line.split("#")[0].trim();

  if (!trimmedLine || line.trim().startsWith("#")) {
    return errors;
  }

  if (trimmedLine.startsWith("HasExplicitMod")) {
    const parts = trimmedLine.split(/\s+/);
    if (parts.length < 2) {
      errors.push({
        line: lineNumber,
        message: "HasExplicitMod requires at least one value",
        severity: "error",
      });
      return errors;
    }

    let startIndex = 1;
    if (parts[1].match(/^[<>]=?\d+$/)) {
      startIndex = 2;
    }

    for (let i = startIndex; i < parts.length; i++) {
      if (!parts[i].match(/^"[^"]*"$/)) {
        errors.push({
          line: lineNumber,
          message: "HasExplicitMod string values must be in quotes",
          severity: "error",
        });
        break;
      }
    }
    return errors;
  }

  if (trimmedLine.match(/Set(Text|Border|Background)Color/)) {
    const colorValues = trimmedLine.split(" ").slice(1);
    colorValues.forEach((value, index) => {
      const num = parseInt(value);
      if (isNaN(num) || num < 0 || num > 255) {
        errors.push({
          line: lineNumber,
          message: `Invalid color value ${value} at position ${
            index + 1
          }. Must be between 0 and 255`,
          severity: "error",
        });
      }
    });

    if (colorValues.length < 3 || colorValues.length > 4) {
      errors.push({
        line: lineNumber,
        message: "Color commands must have 3 or 4 values (RGB[A])",
        severity: "error",
      });
    }
  }

  if (trimmedLine.startsWith("SetFontSize")) {
    const size = parseInt(trimmedLine.split(" ")[1]);
    if (isNaN(size) || size < 18 || size > 45) {
      errors.push({
        line: lineNumber,
        message: "Font size must be between 18 and 45",
        severity: "error",
      });
    }
  }

  if (
    trimmedLine.startsWith("BaseType") ||
    trimmedLine.startsWith("Class") ||
    trimmedLine.startsWith("HasExplicitMod")
  ) {
    const valuesPart = trimmedLine.split(/\s+/).slice(1).join(" ");
    const hasMultipleValues = valuesPart.split(/\s+/).length > 1;
    if (hasMultipleValues && !trimmedLine.includes('"')) {
      errors.push({
        line: lineNumber,
        message: "Multiple values should be in quotes",
        severity: "warning",
      });
    }
  }

  if (trimmedLine.startsWith("PlayEffect")) {
    const parts = trimmedLine.split(" ");
    const validColors = [
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
    ];
    if (!validColors.includes(parts[1])) {
      errors.push({
        line: lineNumber,
        message: `Invalid effect color: ${
          parts[1]
        }. Must be one of: ${validColors.join(", ")}`,
        severity: "error",
      });
    }
  }

  return errors;
};

export const validateFilter = (content: string): ValidationResult => {
  const lines = content.split("\n");
  let inBlock = false;
  let hasConditions = false;
  const errors: ValidationError[] = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      return;
    }

    if (trimmedLine === "Show" || trimmedLine === "Hide") {
      if (inBlock && !hasConditions) {
        errors.push({
          line: lineNumber - 1,
          message: "Previous block has no conditions",
          severity: "error",
        });
      }
      inBlock = true;
      hasConditions = false;
      return;
    }

    if (!inBlock && trimmedLine) {
      errors.push({
        line: lineNumber,
        message: "Line must be inside Show/Hide block",
        severity: "error",
      });
      return;
    }

    if (
      trimmedLine.match(
        /^(Class|BaseType|Rarity|DropLevel|ItemLevel|AreaLevel|SocketGroup|Sockets|LinkedSockets|Height|Width|WaystoneTier|HasExplicitMod)/
      )
    ) {
      hasConditions = true;
    }

    errors.push(...validateFilterLine(line, lineNumber));
  });

  if (inBlock && !hasConditions) {
    errors.push({
      line: lines.length,
      message: "Final block has no conditions",
      severity: "error",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
