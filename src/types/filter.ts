export type FilterOperator = "=" | "==" | ">" | "<" | ">=" | "<=";

export interface FilterStyle {
  fontSize?: number;
  textColor?: string;
  borderColor?: string;
  backgroundColor?: string;
  beam?: {
    color: string;
  };
}

export interface FilterCondition {
  type:
    | "Class"
    | "BaseType"
    | "AreaLevel"
    | "ItemLevel"
    | "Rarity"
    | "StackSize"
    | "Quality"
    | "WaystoneTier";
  operator?: FilterOperator;
  value: string | string[] | number;
}

export type FilterBlockType = "Show" | "Hide";

export interface FilterBlock {
  type: FilterBlockType;
  conditions: FilterCondition[];
  style: FilterStyle;
}

export interface FilterContext {
  baseType: string;
  itemClass?: string;
  areaLevel?: number;
  itemLevel?: number;
  rarity?: string;
  stackSize?: number;
  quality?: number;
}
