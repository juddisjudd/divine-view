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

  if (values.length < 3) {
    console.log(`Invalid color format: ${colorLine} - need at least 3 values, got ${values.length}`);
    return undefined;
  }

  const [r, g, b, a = 255] = values;

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    console.log(`Invalid color values: ${colorLine} - NaN detected`);
    return undefined;
  }

  const result = a !== 255
    ? `rgba(${r}, ${g}, ${b}, ${a / 255})`
    : `rgb(${r}, ${g}, ${b})`;
  
  console.log(`Parsed color: ${colorLine} -> ${result}`);
  return result;
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

  return unquotedValues;
};

const parseCondition = (line: string): FilterCondition | null => {
  const trimmedLine = line.split("#")[0].trim();

  if (trimmedLine.startsWith("Class")) {
    const match = trimmedLine.match(/^Class\s*([<>]=?|==?|=)?\s*(.+)$/);
    if (match) {
      return {
        type: "Class",
        operator: (match[1] || "==") as FilterOperator,
        value: parseConditionValue(match[2]),
      };
    }
  }

  if (trimmedLine.startsWith("BaseType")) {
    const match = trimmedLine.match(/^BaseType\s*([<>]=?|==?|=)?\s*(.+)$/);
    if (match) {
      return {
        type: "BaseType",
        operator: (match[1] || "==") as FilterOperator,
        value: parseConditionValue(match[2]),
      };
    }
  }

  const numericMatch = trimmedLine.match(
    /^(AreaLevel|ItemLevel|DropLevel|StackSize|Quality|WaystoneTier|Sockets)\s*([<>]=?|==?|=)\s*(\d+)$/
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
    const matches = trimmedLine.match(/^Rarity\s+([<>]=?|==?|=)?\s*(.+)$/);
    if (matches) {
      const [_, operator, value] = matches;
      return {
        type: "Rarity",
        operator: (operator || "==") as FilterOperator,
        value: parseConditionValue(value),
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
  expected: string | number | string[] | number[],
  operator: FilterOperator = "==",
  type: "BaseType" | "Class" | "Rarity" = "BaseType"
): boolean => {
  if (type === "Class") {
    if (actual === "Stackable Currency") {
      if (Array.isArray(expected)) {
        return expected.some(
          (v) =>
            String(v).toLowerCase() === "currency" ||
            String(v).toLowerCase() === "stackable currency"
        );
      }
      const expectedStr = String(expected).toLowerCase();
      return expectedStr === "currency" || expectedStr === "stackable currency";
    }
  }

  const checkMatch = (
    expectedVal: string | number,
    actualStr: string
  ): boolean => {
    const expectedStr = String(expectedVal).toLowerCase().trim();
    actualStr = actualStr.toLowerCase().trim();

    // For exact equality operators, do exact matching
    if (operator === "==" || operator === "=") {
      return actualStr === expectedStr;
    }

    // For other operators or default behavior, do exact matching for BaseType/Class/Rarity
    return actualStr === expectedStr;
  };

  if (Array.isArray(expected)) {
    return expected.some((v) => checkMatch(v, actual));
  }

  return checkMatch(expected, actual);
};

const getItemStyle = (
  filterContent: string,
  context: FilterContext
): { isHidden: boolean; style: FilterStyle } => {
  if (!context.baseType) {
    return { isHidden: false, style: { ...DEFAULT_STYLE } };
  }

  const blocks = filterContent.split(/\n(?=Show|Hide)/g).filter(Boolean);
  console.log(`Found ${blocks.length} filter blocks`);

  const evaluateCondition = (condition: FilterCondition): boolean => {
    let result = false;
    const operator = condition.operator || "==";
    
    switch (condition.type) {
      case "BaseType":
        result = context.baseType
          ? compareStringValues(context.baseType, condition.value, operator, "BaseType")
          : false;
        console.log(`  BaseType condition: "${context.baseType}" ${operator} "${condition.value}" = ${result}`);
        break;

      case "Class":
        result = context.itemClass
          ? compareStringValues(context.itemClass, condition.value, operator, "Class")
          : false;
        console.log(`  Class condition: "${context.itemClass}" ${operator} "${condition.value}" = ${result}`);
        break;

      case "Rarity":
        result = context.rarity
          ? compareStringValues(context.rarity, condition.value, operator, "Rarity")
          : false;
        console.log(`  Rarity condition: "${context.rarity}" ${operator} "${condition.value}" = ${result}`);
        break;

      case "AreaLevel":
        result = context.areaLevel !== undefined
          ? evaluateNumericCondition(
              context.areaLevel,
              operator,
              Number(condition.value)
            )
          : false;
        console.log(`  AreaLevel condition: ${context.areaLevel} ${operator} ${condition.value} = ${result}`);
        break;

      case "ItemLevel":
        result = context.itemLevel !== undefined
          ? evaluateNumericCondition(
              context.itemLevel,
              operator,
              Number(condition.value)
            )
          : false;
        console.log(`  ItemLevel condition: ${context.itemLevel} ${operator} ${condition.value} = ${result}`);
        break;

      case "DropLevel":
        result = context.dropLevel !== undefined
          ? evaluateNumericCondition(
              context.dropLevel,
              operator,
              Number(condition.value)
            )
          : false;
        console.log(`  DropLevel condition: ${context.dropLevel} ${operator} ${condition.value} = ${result}`);
        break;

      case "Quality":
        result = context.quality !== undefined
          ? evaluateNumericCondition(
              context.quality,
              operator,
              Number(condition.value)
            )
          : false;
        console.log(`  Quality condition: ${context.quality} ${operator} ${condition.value} = ${result}`);
        break;

      case "StackSize":
        result = context.stackSize !== undefined
          ? evaluateNumericCondition(
              context.stackSize,
              operator,
              Number(condition.value)
            )
          : false;
        console.log(`  StackSize condition: ${context.stackSize} ${operator} ${condition.value} = ${result}`);
        break;

      case "Sockets":
        result = context.sockets !== undefined
          ? evaluateNumericCondition(
              context.sockets,
              operator,
              Number(condition.value)
            )
          : false;
        console.log(`  Sockets condition: ${context.sockets} ${operator} ${condition.value} = ${result}`);
        break;

      default:
        result = false;
        console.log(`  Unknown condition type: ${condition.type}`);
        break;
    }
    
    return result;
  };

  let matchedBlock: {
    type: FilterBlockType;
    style: FilterStyle;
  } | null = null;

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;

    const blockType = lines[0] as FilterBlockType;
    if (blockType !== "Show" && blockType !== "Hide") continue;

    const conditions: FilterCondition[] = [];
    const blockStyle: FilterStyle = { ...DEFAULT_STYLE };

    for (const line of lines.slice(1)) {
      const condition = parseCondition(line);
      if (condition) {
        conditions.push(condition);
      } else if (line.startsWith("Set") || line.startsWith("Play")) {
        const parsedStyle = parseStyle([line]);
        if (parsedStyle.textColor) blockStyle.textColor = parsedStyle.textColor;
        if (parsedStyle.borderColor)
          blockStyle.borderColor = parsedStyle.borderColor;
        if (parsedStyle.backgroundColor)
          blockStyle.backgroundColor = parsedStyle.backgroundColor;
        if (parsedStyle.fontSize) blockStyle.fontSize = parsedStyle.fontSize;
        if (parsedStyle.beam) blockStyle.beam = parsedStyle.beam;
      }
    }

    // A block matches if:
    // 1. It has no conditions (catch-all), OR
    // 2. It has conditions and ALL conditions match
    const blockMatches = conditions.length === 0 || 
      conditions.every((cond) => evaluateCondition(cond));
    
    console.log(`\n=== EVALUATING ${blockType.toUpperCase()} BLOCK ===`);
    console.log(`Conditions (${conditions.length}):`, conditions.map(c => `${c.type} ${c.operator || '=='} ${c.value}`));
    console.log(`Block matches: ${blockMatches}`);
    if (blockMatches) {
      console.log('Style:', blockStyle);
    }
    
    if (blockMatches) {
      matchedBlock = {
        type: blockType,
        style: blockStyle,
      };
      console.log(`SELECTED BLOCK: ${blockType} with style:`, blockStyle);
      break;
    }
  }

  if (!matchedBlock) {
    return {
      isHidden: false,
      style: { ...DEFAULT_STYLE },
    };
  }

  return {
    isHidden: matchedBlock.type === "Hide",
    style: matchedBlock.style,
  };
};

export { getItemStyle };
