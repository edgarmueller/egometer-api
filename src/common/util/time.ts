export const diffMins = (date1: Date, date2: Date, mins: number) => 
      (date1.getTime() - date2.getTime())/60000 < mins