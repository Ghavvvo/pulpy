import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

const StatCard = ({ title, value, change, changeType = "neutral", icon: Icon }: StatCardProps) => {
  const changeColors = {
    positive: "text-green-600 bg-green-100",
    negative: "text-red-600 bg-red-100",
    neutral: "text-muted-foreground bg-muted",
  };

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-card-foreground">{value}</p>
            {change && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${changeColors[changeType]}`}>
                {change}
              </span>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
