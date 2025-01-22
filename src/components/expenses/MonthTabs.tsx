import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRef, useEffect } from "react";

interface MonthTabsProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const MonthTabs = ({ selectedMonth, onMonthChange }: MonthTabsProps) => {
  const tabsRef = useRef<HTMLDivElement>(null);
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');

  useEffect(() => {
    if (tabsRef.current) {
      const currentMonthTab = tabsRef.current.querySelector(`[data-value="${currentMonth}"]`);
      if (currentMonthTab) {
        currentMonthTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentMonth]);

  return (
    <div className="relative w-full" ref={tabsRef}>
      <Tabs 
        defaultValue={currentMonth}
        value={selectedMonth}
        onValueChange={onMonthChange}
        className="w-full"
      >
        <TabsList className="h-12 items-center justify-start w-full overflow-x-scroll no-scrollbar">
          {months.map((month, index) => (
            <TabsTrigger
              key={index}
              value={(index + 1).toString().padStart(2, '0')}
              className="min-w-[100px] rounded-full whitespace-nowrap bg-transparent"
              data-value={(index + 1).toString().padStart(2, '0')}
              style={{
                background: selectedMonth === (index + 1).toString().padStart(2, '0') 
                  ? "linear-gradient(to right, #243949 0%, #517fa4 100%)" 
                  : "transparent",
                color: selectedMonth === (index + 1).toString().padStart(2, '0') ? "white" : "inherit"
              }}
            >
              {month}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};