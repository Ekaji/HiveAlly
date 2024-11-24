// import { Link } from "react-router-dom";
import Card from "./Card";

export default function ResponsiveGrid() {
    const cardsData = [
      {
        image:
          "https://images.pexels.com/photos/196667/pexels-photo-196667.jpeg?",
        date: "27",
        month: "March",
        title: "Best View in New York City",
        description: "The city that never sleeps",
        footerText: "6 mins ago",
      },
      {
        image:
          "https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
        date: "20",
        month: "March",
        title: "Best Pizza in Town",
        description: "The collection of best pizza images in New York City",
        footerText: "3 mins read",
      },
      {
        image:
          "https://images.pexels.com/photos/257816/pexels-photo-257816.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
        date: "15",
        month: "April",
        title: "Best Salad Images Ever",
        description: "The collection of best salads of town in pictures",
        footerText: "6 mins read",
      },
    ];
  
    return (
      <div className="max-w-screen-xl mx-auto py-5 sm:py-10 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {cardsData.map((card, index) => (
            <Card key={index} {...card} />
          ))}
        </div>
      </div>
    );
  };
