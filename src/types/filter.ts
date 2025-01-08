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
    | "Sockets"
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

export interface ItemOptions {
  stackable: boolean;
  rarity: string[] | false;
  areaLevel: boolean;
  itemLevel: boolean;
  dropLevel: boolean;
  quality: boolean;
  sockets: boolean;
}

export interface FilterContext {
  baseType: string;
  itemClass: string;
  itemOptions?: ItemOptions;
  areaLevel?: number;
  itemLevel?: number;
  rarity?: string;
  stackSize?: number;
  quality?: number;
  sockets?: number;
}

export interface ValidationMessage {
  line: number;
  message: string;
  severity: "error" | "warning";
}
