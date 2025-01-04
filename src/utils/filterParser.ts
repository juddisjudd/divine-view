import {
  FilterBlock,
  FilterStyle,
  FilterContext,
  FilterCondition,
  FilterBlockType,
  FilterOperator,
} from "@/types/filter";

const DEFAULT_STYLE: FilterStyle = {
  textColor: "rgb(158, 155, 138)",
  borderColor: "rgb(0, 0, 0)",
  backgroundColor: "rgb(0, 0, 0)",
  fontSize: 32,
};

const parseColor = (colorLine: string): string | undefined => {
  const parts = colorLine.trim().split(/\s+/);
  const values = parts.slice(1).map(Number);

  if (values.length < 3) return undefined;

  const [r, g, b, a = 255] = values;

  if (isNaN(r) || isNaN(g) || isNaN(b)) return undefined;

  return a !== 255
    ? `rgba(${r}, ${g}, ${b}, ${a / 255})`
    : `rgb(${r}, ${g}, ${b})`;
};

const parseEffect = (line: string): FilterStyle["beam"] | undefined => {
  const parts = line.trim().split(/\s+/);
  if (parts[0] !== "PlayEffect" || parts.length < 2) return undefined;

  if (parts[2] && parts[2].toLowerCase() === "temp") return undefined;

  return {
    color: getBeamColor(parts[1]),
  };
};

const getBeamColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    Yellow: "#FFD700",
    White: "#FFFFFF",
    Red: "#FF0000",
    Green: "#00FF00",
    Blue: "#0000FF",
    Brown: "#8B4513",
    Cyan: "#00FFFF",
    Grey: "#808080",
    Orange: "#FFA500",
    Pink: "#FFC0CB",
    Purple: "#800080",
  };

  return colorMap[color] || colorMap.White;
};

const parseStyle = (lines: string[]): FilterStyle => {
  const style: FilterStyle = {};

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("SetFontSize")) {
      const size = parseInt(trimmedLine.split(/\s+/)[1]);
      if (!isNaN(size)) style.fontSize = size;
    } else if (trimmedLine.startsWith("SetTextColor")) {
      const color = parseColor(trimmedLine);
      if (color) style.textColor = color;
    } else if (trimmedLine.startsWith("SetBorderColor")) {
      const color = parseColor(trimmedLine);
      if (color) style.borderColor = color;
    } else if (trimmedLine.startsWith("SetBackgroundColor")) {
      const color = parseColor(trimmedLine);
      if (color) style.backgroundColor = color;
    } else if (trimmedLine.startsWith("PlayEffect")) {
      const beam = parseEffect(trimmedLine);
      if (beam) style.beam = beam;
    }
  });

  return style;
};

const parseConditionValue = (value: string): string | string[] => {
  const valueWithoutComments = value.split("#")[0].trim();

  const quotedValues = valueWithoutComments.match(/"([^"]*)"/g);
  if (quotedValues) {
    return quotedValues.map((v) => v.replace(/^"|"$/g, "").trim());
  }

  const unquotedValues = valueWithoutComments
    .split(/\s+/)
    .filter(Boolean)
    .map((v) => v.trim());

  if (unquotedValues.length === 1) {
    return unquotedValues[0];
  }

  return unquotedValues.join(" ");
};

const parseCondition = (line: string): FilterCondition | null => {
  const trimmedLine = line.split("#")[0].trim();

  if (trimmedLine.startsWith("Class")) {
    const match = trimmedLine.match(/^Class\s+(.+)$/);
    if (match) {
      return {
        type: "Class",
        value: parseConditionValue(match[1]),
      };
    }
  }

  if (trimmedLine.startsWith("BaseType")) {
    const match = trimmedLine.match(/^BaseType\s*(?:==)?\s*(.+)$/);
    if (match) {
      return {
        type: "BaseType",
        value: parseConditionValue(match[1]),
      };
    }
  }

  const numericMatch = trimmedLine.match(
    /^(AreaLevel|ItemLevel|StackSize|Quality|WaystoneTier)\s*([<>]=?|==?|=)\s*(\d+)$/
  );
  if (numericMatch) {
    const [_, type, operator, value] = numericMatch;
    return {
      type: type as FilterCondition["type"],
      operator: operator as FilterOperator,
      value: parseInt(value),
    };
  }

  if (trimmedLine.startsWith("Rarity")) {
    const matches = trimmedLine.match(/^Rarity\s+(.+)$/);
    if (matches) {
      return {
        type: "Rarity",
        value: parseConditionValue(matches[1]),
      };
    }
  }

  return null;
};

const evaluateNumericCondition = (
  value: number,
  operator: FilterOperator,
  target: number
): boolean => {
  switch (operator) {
    case ">":
      return value > target;
    case ">=":
      return value >= target;
    case "<":
      return value < target;
    case "<=":
      return value <= target;
    case "=":
    case "==":
      return value === target;
    default:
      return false;
  }
};

const compareStringValues = (
  actual: string,
  expected: string | string[]
): boolean => {
  if (Array.isArray(expected)) {
    return expected.some(
      (v) => actual.toLowerCase() === String(v).toLowerCase().trim()
    );
  }

  const actualLower = actual.toLowerCase().trim();
  const expectedLower = String(expected).toLowerCase().trim();

  return actualLower === expectedLower;
};

const evaluateCondition = (
  condition: FilterCondition,
  context: FilterContext
): boolean => {
  switch (condition.type) {
    case "BaseType":
      return context.baseType
        ? compareStringValues(
            context.baseType,
            condition.value as string | string[]
          )
        : false;

    case "Class":
      return context.itemClass
        ? compareStringValues(
            context.itemClass,
            condition.value as string | string[]
          )
        : false;

    case "Rarity":
      return context.rarity
        ? compareStringValues(
            context.rarity,
            condition.value as string | string[]
          )
        : false;

    case "AreaLevel":
      return context.areaLevel !== undefined
        ? evaluateNumericCondition(
            context.areaLevel,
            condition.operator || "=",
            Number(condition.value)
          )
        : false;

    case "ItemLevel":
      return context.itemLevel !== undefined
        ? evaluateNumericCondition(
            context.itemLevel,
            condition.operator || "=",
            Number(condition.value)
          )
        : false;

    case "Quality":
      return context.quality !== undefined
        ? evaluateNumericCondition(
            context.quality,
            condition.operator || "=",
            Number(condition.value)
          )
        : false;

    case "StackSize":
      return context.stackSize !== undefined
        ? evaluateNumericCondition(
            context.stackSize,
            condition.operator || "=",
            Number(condition.value)
          )
        : false;

    default:
      return false;
  }
};

const getItemStyle = (
  filterContent: string,
  context: FilterContext
): { isHidden: boolean; style: FilterStyle } => {
  if (!context.baseType) {
    return { isHidden: false, style: { ...DEFAULT_STYLE } };
  }

  const blocks = filterContent.split(/\n(?=Show|Hide)/g).filter(Boolean);

  const checkBaseTypeMatch = (line: string): boolean => {
    if (!line.startsWith("BaseType")) return false;

    const isExactMatch = line.includes("==");

    const values =
      line.match(/"([^"]*)"/g)?.map((s) => s.replace(/"/g, "")) || [];

    if (isExactMatch) {
      return values.some((value) => context.baseType.includes(value));
    } else {
      return values.includes(context.baseType);
    }
  };

  const checkBlockMatch = (lines: string[]): boolean => {
    let hasBaseTypeOrClassMatch = false;
    let allConditionsMatch = true;

    for (const line of lines) {
      const cleanLine = line.split("#")[0].trim();
      if (!cleanLine || cleanLine === "Show" || cleanLine === "Hide") continue;

      if (cleanLine.startsWith("BaseType")) {
        hasBaseTypeOrClassMatch = checkBaseTypeMatch(cleanLine);
        if (!hasBaseTypeOrClassMatch) {
          allConditionsMatch = false;
          break;
        }
      } else if (cleanLine.startsWith("Rarity") && context.rarity) {
        const rarityMatch = cleanLine
          .toLowerCase()
          .includes(context.rarity.toLowerCase());
        if (!rarityMatch) {
          allConditionsMatch = false;
          break;
        }
      } else if (
        cleanLine.startsWith("AreaLevel") &&
        context.areaLevel !== undefined
      ) {
        const match = cleanLine.match(/AreaLevel\s*([<>]=?|=|==)\s*(\d+)/);
        if (match) {
          const [_, operator, value] = match;
          if (
            !evaluateNumericCondition(
              context.areaLevel,
              operator as FilterOperator,
              parseInt(value)
            )
          ) {
            allConditionsMatch = false;
            break;
          }
        }
      } else if (
        cleanLine.startsWith("ItemLevel") &&
        context.itemLevel !== undefined
      ) {
        const match = cleanLine.match(/ItemLevel\s*([<>]=?|=|==)\s*(\d+)/);
        if (match) {
          const [_, operator, value] = match;
          if (
            !evaluateNumericCondition(
              context.itemLevel,
              operator as FilterOperator,
              parseInt(value)
            )
          ) {
            allConditionsMatch = false;
            break;
          }
        }
      }
    }

    return hasBaseTypeOrClassMatch && allConditionsMatch;
  };

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;

    const blockType = lines[0];
    if (blockType !== "Show" && blockType !== "Hide") continue;

    if (checkBlockMatch(lines)) {
      const style: FilterStyle = {};
      for (const line of lines) {
        const cleanLine = line.split("#")[0].trim();
        if (!cleanLine) continue;

        if (cleanLine.startsWith("Set") || cleanLine.startsWith("Play")) {
          Object.assign(style, parseStyle([cleanLine]));
        }
      }

      return {
        isHidden: blockType === "Hide",
        style: {
          textColor: style.textColor || DEFAULT_STYLE.textColor,
          borderColor: style.borderColor || DEFAULT_STYLE.borderColor,
          backgroundColor:
            style.backgroundColor || DEFAULT_STYLE.backgroundColor,
          fontSize: style.fontSize || DEFAULT_STYLE.fontSize,
          beam: style.beam,
        },
      };
    }
  }

  return {
    isHidden: false,
    style: { ...DEFAULT_STYLE },
  };
};

export { getItemStyle };
