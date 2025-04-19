import { TimelineItem } from "@shared/schema";

interface TimelineProps {
  items: TimelineItem[];
  title?: string;
}

export default function Timeline({ items, title = "Project Timeline" }: TimelineProps) {
  // Sort timeline items by order
  const sortedItems = [...items].sort((a, b) => a.order - b.order);
  
  if (!items || items.length === 0) {
    return (
      <div className="text-center p-8 bg-slate-100 rounded-lg mb-10">
        <p className="text-slate-500">No timeline information available</p>
      </div>
    );
  }
  
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">{title}</h2>
      <div className="space-y-6">
        {sortedItems.map((item, index) => (
          <div key={item.id} className="flex">
            <div className="flex flex-col items-center mr-4">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              {index < sortedItems.length - 1 && (
                <div className="w-0.5 h-full bg-slate-200"></div>
              )}
            </div>
            <div className="pb-6">
              <div className="flex items-center mb-1">
                <h3 className="text-lg font-semibold text-slate-800">{item.title}</h3>
                <span className="ml-auto text-sm text-slate-500">{item.date}</span>
              </div>
              <p className="text-slate-600">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
