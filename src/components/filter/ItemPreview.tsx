import React, { useState, useEffect, useMemo } from "react";
import { EyeOff } from "lucide-react";
import { FilterContext, FilterStyle, ItemOptions } from "@/types/filter";
import { getItemStyle } from "@/utils/filterParser";
import { cn } from "@/lib/utils";

interface ItemPreviewProps {
  filterContent: string;
  itemName: string;
  itemClass: string;
  itemOptions?: ItemOptions;
  areaLevel?: number;
  itemLevel?: number;
  rarity?: string;
  stackSize?: number;
  quality?: number;
  sockets?: number;
}

export const ItemPreview: React.FC<ItemPreviewProps> = ({
  filterContent,
  itemName,
  itemClass,
  itemOptions,
  areaLevel,
  itemLevel,
  rarity,
  stackSize,
  quality,
  sockets,
}) => {
  const [isAltPressed, setIsAltPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Alt") {
        e.preventDefault();
        setIsAltPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") {
        setIsAltPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const { isHidden, style } = useMemo(() => {
    const context: FilterContext = {
      baseType: itemName,
      itemClass: itemClass,
      itemOptions,
    };

    if (itemOptions?.areaLevel && areaLevel !== undefined) {
      context.areaLevel = areaLevel;
    }

    if (itemOptions?.itemLevel && itemLevel !== undefined) {
      context.itemLevel = itemLevel;
    }

    if (itemOptions?.rarity && rarity) {
      context.rarity = rarity;
    }

    if (
      itemOptions?.stackable &&
      itemName === "Gold" &&
      stackSize !== undefined
    ) {
      context.stackSize = stackSize;
    }

    if (itemOptions?.quality && quality !== undefined) {
      context.quality = quality;
    }

    if (itemOptions?.sockets && sockets !== undefined) {
      context.sockets = sockets;
    }

    return getItemStyle(filterContent, context);
  }, [
    filterContent,
    itemName,
    itemClass,
    itemOptions,
    areaLevel,
    itemLevel,
    rarity,
    stackSize,
    quality,
    sockets,
  ]);

  const renderItemContent = () => {
    if (!itemName || !itemClass) {
      return (
        <div className="text-gray-400 text-center text-sm px-4">
          Select an item type and base type to preview
        </div>
      );
    }

    if (isHidden && !isAltPressed) {
      return (
        <div className="flex flex-col items-center text-gray-400 bg-black/50 p-4 rounded">
          <EyeOff className="w-8 h-8 mb-2" />
          <p className="text-sm text-center">
            This item is hidden by filter
            <br />
            <span className="text-xs opacity-75">
              (Hold Alt to show hidden items)
            </span>
          </p>
        </div>
      );
    }

    return (
      <div className={cn("relative", isHidden && isAltPressed && "opacity-50")}>
        {style.beam && !isHidden && <Beam color={style.beam.color} />}
        <ItemLabel
          name={itemName}
          style={style}
          isHidden={isHidden}
          isAltPressed={isAltPressed}
        />
      </div>
    );
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-[384px] h-[245px]">
        <div
          className="absolute inset-0 flex items-center justify-center bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/preview-bg.png')" }}
        >
          {renderItemContent()}
        </div>
      </div>
    </div>
  );
};

const Beam: React.FC<{ color: string }> = ({ color }) => (
  <>
    {/* Upper beam section */}
    <div
      className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
      style={{ top: "-110px", bottom: "50%", zIndex: 0 }}
    >
      {/* Central beam */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[2px] h-full"
        style={{
          background: `linear-gradient(to bottom, transparent 0%, ${color} 50%, ${color} 100%)`,
        }}
      />
      {/* Inner glow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[4px] h-full"
        style={{
          background: `linear-gradient(to bottom, transparent 0%, ${color}40 50%, ${color}60 100%)`,
          filter: "blur(3px)",
        }}
      />
      {/* Outer glow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[8px] h-full"
        style={{
          background: `linear-gradient(to bottom, transparent 0%, ${color}20 50%, ${color}30 100%)`,
          filter: "blur(6px)",
        }}
      />
    </div>

    {/* Lower beam section */}
    <div
      className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
      style={{ top: "50%", height: "14px", zIndex: 0 }}
    >
      {/* Central beam */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[2px] h-full"
        style={{
          background: color,
        }}
      />
      {/* Inner glow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[4px] h-full"
        style={{
          background: `${color}80`,
          filter: "blur(3px)",
        }}
      />
      {/* Outer glow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[8px] h-full"
        style={{
          background: `${color}40`,
          filter: "blur(6px)",
        }}
      />

      {/* Base glow effect */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
        <div
          className="w-6 h-12 rounded-full"
          style={{
            background: `radial-gradient(circle, ${color}60 0%, transparent 70%)`,
            filter: "blur(6px)",
            transform: "translate(2%, -50%)",
          }}
        />
        <div
          className="w-6 h-8 rounded-full"
          style={{
            background: `radial-gradient(circle, white 0%, ${color} 50%, transparent 100%)`,
            filter: "blur(4px)",
            transform: "translate(2%, 50%)",
          }}
        />
      </div>
    </div>
  </>
);

interface ItemLabelProps {
  name: string;
  style: FilterStyle;
  isHidden: boolean;
  isAltPressed: boolean;
}

const ItemLabel: React.FC<ItemLabelProps> = ({
  name,
  style,
  isHidden,
  isAltPressed,
}) => (
  <div
    className="px-2 py-0.5 text-center relative z-10"
    style={{
      color: style.textColor || "inherit",
      backgroundColor: style.backgroundColor || "transparent",
      border: style.borderColor ? `1px solid ${style.borderColor}` : undefined,
      fontSize: style.fontSize ? `${style.fontSize * 0.5}px` : "16px",
      whiteSpace: "pre-wrap",
      lineHeight: "1.2",
      minWidth: "120px",
      maxWidth: "240px",
    }}
  >
    {name}
    {isHidden && isAltPressed && (
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 whitespace-nowrap bg-black/75 px-1 rounded">
        Hidden by filter (Alt pressed)
      </div>
    )}
  </div>
);

export default ItemPreview;
