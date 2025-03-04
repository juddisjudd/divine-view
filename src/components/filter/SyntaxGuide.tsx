import React from "react";

export const SyntaxGuide: React.FC = () => {
  return (
    <div className="p-6 text-white overflow-y-auto h-full">
      <h2 className="text-xl font-bold mb-6">Filter Syntax Guide</h2>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Basic Structure</h3>
        <div className="bg-[#0e0e0e] p-4 rounded-md mb-4">
          <pre className="text-gray-300">
            {`# This is a comment
Show
    [Condition1]
    [Condition2]
    [Action1]
    [Action2]
Hide
    [Condition1]
    [Condition2]`}
          </pre>
        </div>
        <p className="text-gray-400 mb-2">
          A block is defined as a collection of lines, which have a singular
          purpose. A block must begin with a &quot;Show&quot; or &quot;Hide&quot; line. A block ends
          when another line containing Show or Hide is read by the client.
        </p>
        <p className="text-gray-400">
          The most important thing to note is that blocks are read from top to
          bottom in the file. The highest block takes priority, which means that
          specific conditions should be placed before more general ones.
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Common Conditions</h3>
        <ul className="space-y-2">
          <li>
            <code className="bg-[#0e0e0e] px-2 py-1 rounded">Class</code> - Item
            class (e.g., "Amulets", "Body Armours")
          </li>
          <li>
            <code className="bg-[#0e0e0e] px-2 py-1 rounded">BaseType</code> -
            Base item type (e.g., "Chaos Orb", "Solar Amulet")
          </li>
          <li>
            <code className="bg-[#0e0e0e] px-2 py-1 rounded">
              Rarity [Operator] &lt;Rarity&gt;
            </code>{" "}
            - Item rarity (Normal, Magic, Rare, Unique)
          </li>
          <li>
            <code className="bg-[#0e0e0e] px-2 py-1 rounded">
              DropLevel [Operator] &lt;Level&gt;
            </code>{" "}
            - The level that the item starts dropping at
          </li>
          <li>
            <code className="bg-[#0e0e0e] px-2 py-1 rounded">
              ItemLevel [Operator] &lt;Level&gt;
            </code>{" "}
            - The item level the item was generated at
          </li>
          <li>
            <code className="bg-[#0e0e0e] px-2 py-1 rounded">
              AreaLevel [Operator] &lt;Level&gt;
            </code>{" "}
            - Monster level of the current area
          </li>
          <li>
            <code className="bg-[#0e0e0e] px-2 py-1 rounded">
              Quality [Operator] &lt;Quality&gt;
            </code>{" "}
            - Item quality percentage (0-20)
          </li>
          <li>
            <code className="bg-[#0e0e0e] px-2 py-1 rounded">
              Sockets [Operator] &lt;Count&gt;
            </code>{" "}
            - Number of sockets on the item
          </li>
          <li>
            <code className="bg-[#0e0e0e] px-2 py-1 rounded">
              StackSize [Operator] &lt;Value&gt;
            </code>{" "}
            - Size of stack for stackable items
          </li>
          <li>
            <code className="bg-[#0e0e0e] px-2 py-1 rounded">
              WaystoneTier [Operator] &lt;Value&gt;
            </code>{" "}
            - The tier of a Waystone item
          </li>
        </ul>
        <p className="text-gray-400 mt-2">
          Valid operators:{" "}
          <code className="bg-[#0e0e0e] px-2 py-1 rounded">
            = == &gt; &lt; &gt;= &lt;=
          </code>
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Common Actions</h3>
        <ul className="space-y-2">
          <li>
            <code className="bg-[#0e0e0e] px-2 py-1 rounded">
              SetTextColor &lt;Red&gt; &lt;Green&gt; &lt;Blue&gt; [Alpha]
            </code>{" "}
            - Sets text color (0-255 values)
          </li>
          <li>
            <code className="bg-[#0e0e0e] px-2 py-1 rounded">
              SetBorderColor &lt;Red&gt; &lt;Green&gt; &lt;Blue&gt; [Alpha]
            </code>{" "}
            - Sets border color (0-255 values)
          </li>
          <li>
            <code className="bg-[#0e0e0e] px-2 py-1 rounded">
              SetBackgroundColor &lt;Red&gt; &lt;Green&gt; &lt;Blue&gt; [Alpha]
            </code>{" "}
            - Sets background color (0-255 values)
          </li>
          <li>
            <code className="bg-[#0e0e0e] px-2 py-1 rounded">
              SetFontSize &lt;FontSize&gt;
            </code>{" "}
            - Sets font size (18-45, default: 32)
          </li>
          <li>
            <code className="bg-[#0e0e0e] px-2 py-1 rounded">
              PlayEffect &lt;Color&gt; [Temp]
            </code>{" "}
            - Displays a colored beam of light (Red, Green, Blue, Brown, White,
            Yellow, Cyan, Grey, Orange, Pink, Purple)
          </li>
          <li>
            <code className="bg-[#0e0e0e] px-2 py-1 rounded">
              PlayAlertSound &lt;Id&gt; [Volume]
            </code>{" "}
            - Plays a sound when item drops (1-16, Volume: 0-300)
          </li>
          <li>
            <code className="bg-[#0e0e0e] px-2 py-1 rounded">
              MinimapIcon &lt;Size&gt; &lt;Color&gt; &lt;Shape&gt;
            </code>{" "}
            - Displays an icon on the minimap (Size: 0, 1, 2 or -1 to disable)
          </li>
          <li>
            <code className="bg-[#0e0e0e] px-2 py-1 rounded">
              DisableDropSound
            </code>{" "}
            - Disables the drop sound
          </li>
        </ul>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Using Quotation Marks</h3>
        <p className="text-gray-400 mb-2">
          Always use quotes for multi-word classes or base types:
        </p>
        <div className="bg-[#0e0e0e] p-4 rounded-md mb-4">
          <pre className="text-gray-300">
            {`# Incorrect - will match &quot;One&quot;, &quot;Hand&quot;, and &quot;Swords&quot; separately
Show
    Class One Hand Swords
    
# Correct - will only match &quot;One Hand Swords&quot; exactly
Show
    Class &quot;One Hand Swords&quot;`}
          </pre>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-4">Example</h3>
        <div className="bg-[#0e0e0e] p-4 rounded-md">
          <pre className="text-gray-300">
            {`# Highlight quality gems
Show
    Class Gem
    Quality &gt; 0
    SetBackgroundColor 0 40 30
    SetBorderColor 0 50 160

# Highlight rare gems
Show
    Class Gem
    BaseType &quot;Empower&quot; &quot;Enhance&quot; &quot;Portal&quot; &quot;Detonate Mines&quot;
    SetBorderColor 0 50 160
    
# Hide low-level flasks
Hide
    BaseType Flask
    Quality &lt; 10
    
# Show valuable currency
Show
    BaseType &quot;Chaos Orb&quot; &quot;Exalted Orb&quot;
    SetTextColor 255 0 0
    SetBorderColor 255 0 0
    SetBackgroundColor 20 20 0 255
    PlayEffect Yellow
    MinimapIcon 0 Yellow Star`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default SyntaxGuide;