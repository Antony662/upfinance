
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { safeNumber, formatCurrency } from "../utils/safeNumbers";

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  color = "bg-blue-500",
  prefix = "" 
}) {
  const isPositive = changeType === "positive";
  const safeValue = safeNumber(value);
  
  return (
    <Card className="relative overflow-hidden border-0 shadow-sm bg-white">
      <div className={`absolute top-0 right-0 w-20 h-20 lg:w-32 lg:h-32 ${color} opacity-5 rounded-full transform translate-x-4 lg:translate-x-8 -translate-y-4 lg:-translate-y-8`} />
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1 lg:space-y-2 flex-1 min-w-0">
            <p className="text-xs lg:text-sm font-medium text-slate-500 truncate">{title}</p>
            <p className="text-lg lg:text-2xl font-bold text-slate-900 truncate">
              {prefix}{formatCurrency(safeValue)}
            </p>
            {change && (
              <div className="flex items-center gap-1 text-xs lg:text-sm">
                {isPositive ? (
                  <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <TrendingDown className="w-3 h-3 lg:w-4 lg:h-4 text-red-500 flex-shrink-0" />
                )}
                <span className={`${isPositive ? "text-green-600" : "text-red-600"} flex-shrink-0`}>
                  {change}
                </span>
                <span className="text-slate-500 hidden lg:inline">vs mês anterior</span>
              </div>
            )}
          </div>
          <div className={`p-2 lg:p-3 rounded-xl ${color} bg-opacity-10 flex-shrink-0`}>
            <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${color.replace('bg-', 'text-')}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
