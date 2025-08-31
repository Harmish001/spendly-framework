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
     <div className="sticky top-0 z-50 w-full md:px-72 rounded-b-[24px] md:rounded-b-[0px]" ref={tabsRef} style={{ background: "linear-gradient(to right, #9333ea, #2563eb)" }}>
      <Tabs
        defaultValue={currentMonth}
        value={selectedMonth}
        onValueChange={onMonthChange}
        className="w-full"
      >
        <TabsList className="h-16 items-center justify-start w-full overflow-x-scroll no-scrollbar" style={{ scrollbarWidth: "none", background: "transparent" }}>
          {months.map((month, index) => (
            <TabsTrigger
              key={index}
              value={(index + 1).toString().padStart(2, '0')}
              className="min-w-[100px] rounded-[24px] whitespace-nowrap bg-transparent text-md"
              data-value={(index + 1).toString().padStart(2, '0')}
              style={{
                background: "transparent",
                color: selectedMonth === (index + 1).toString().padStart(2, '0') ? "yellow" : "white"
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