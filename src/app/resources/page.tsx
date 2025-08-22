import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { ResourceSection } from "@/components/resources/ResourceSection";
import { ResourceCard } from "@/components/resources/ResourceCard";

const INFORMATION_RESOURCES = [
  {
    title: "PoE2DB",
    description:
      "Database and index for information from the ggpk and have community fan wiki",
    url: "https://poe2db.tw/",
  },
  {
    title: "PoE2 Community Wiki",
    description: "Community fan wiki",
    url: "https://www.poe2wiki.net/",
  },
];

const FILTER_RESOURCES = [
  {
    title: "FilterBlade",
    description:
      "Advanced loot filter customization tool for Path of Exile 2. Customize your loot filter and preview the changes in real-time.",
    url: "https://www.filterblade.xyz/",
  },
  {
    title: "poe2filter.com",
    description:
      "Easy-to-use custom loot filter generation website with minimal changes to styles. Contains fully economy-tiered currency items.",
    url: "https://poe2filter.com/",
  },
  {
    title: "Chromatic PoE",
    description:
      "Chromatic PoE is a tool to generate item filters for Path of Exile. It is free and open source for the peace of mind of anyone that uses it.",
    url: "https://github.com/jchantrell/chromatic-poe",
  },
];

const MISC_TOOLS = [
  {
    title: "POE2 Quest Tracker",
    description: "A desktop overlay application for tracking quests and rewards in Path of Exile 2.",
    url: "https://github.com/juddisjudd/poe2-quest-tracker",
  },
  {
    title: "Sidekick",
    description:
      "A Path of Exile and Path of Exile 2 companion tool. Price check items, check for dangerous map modifiers, and more!",
    url: "https://github.com/Sidekick-Poe/Sidekick",
  },
];

export default function ResourcesPage() {
  return (
    <DefaultLayout>
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold text-white mb-8">Resources</h1>

        <ResourceSection title="Information Resources">
          {INFORMATION_RESOURCES.map((resource) => (
            <ResourceCard
              key={resource.title}
              title={resource.title}
              description={resource.description}
              url={resource.url}
            />
          ))}
        </ResourceSection>

        <ResourceSection title="Filter Utilities">
          {FILTER_RESOURCES.map((resource) => (
            <ResourceCard
              key={resource.title}
              title={resource.title}
              description={resource.description}
              url={resource.url}
            />
          ))}
        </ResourceSection>

        <ResourceSection title="Misc Tools">
          {MISC_TOOLS.map((resource) => (
            <ResourceCard
              key={resource.title}
              title={resource.title}
              description={resource.description}
              url={resource.url}
            />
          ))}
        </ResourceSection>
      </div>
    </DefaultLayout>
  );
}
