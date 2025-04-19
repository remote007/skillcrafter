import { Metric, Testimonial } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";

interface MetricsDisplayProps {
  metrics: Metric[];
  testimonials: Testimonial[];
  title?: string;
}

export default function MetricsDisplay({ 
  metrics, 
  testimonials, 
  title = "Outcomes & Impact" 
}: MetricsDisplayProps) {
  const hasMetrics = metrics && metrics.length > 0;
  const hasTestimonials = testimonials && testimonials.length > 0;
  
  if (!hasMetrics && !hasTestimonials) {
    return (
      <div className="text-center p-8 bg-slate-100 rounded-lg mb-10">
        <p className="text-slate-500">No outcomes or impact data available</p>
      </div>
    );
  }
  
  // Icon mapping
  const getIconClass = (icon?: string) => {
    if (!icon) return "fas fa-chart-line";
    return icon;
  };
  
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hasMetrics && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-800">Key Metrics</h3>
              <ul className="space-y-3">
                {metrics.map((metric) => (
                  <li key={metric.id} className="flex items-center">
                    <div className="bg-green-100 rounded-full p-2 mr-3">
                      <i className={getIconClass(metric.icon) + " text-success"}></i>
                    </div>
                    <div>
                      <span className="block text-slate-800 font-semibold">{metric.value}</span>
                      <span className="text-sm text-slate-500">{metric.subtitle}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        
        {hasTestimonials && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-800">Testimonials</h3>
              <div className="space-y-4">
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={testimonial.id} 
                    className={`${index < testimonials.length - 1 ? "pb-4 border-b border-slate-100" : ""}`}
                  >
                    <p className="text-slate-600 italic mb-2">{testimonial.text}</p>
                    <p className="text-sm font-medium text-slate-700">
                      — {testimonial.author}
                      {testimonial.position && `, ${testimonial.position}`}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
