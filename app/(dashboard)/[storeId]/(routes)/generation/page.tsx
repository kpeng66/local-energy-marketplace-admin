"use client";

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LinearScale, LineController, PointElement, LineElement, CategoryScale, Tooltip, Title } from 'chart.js';

Chart.register(LinearScale, LineController, PointElement, LineElement, CategoryScale, Tooltip, Title);

import CurrentMonthDisplay from '@/components/current-month-display';
import { getSolarOutput } from '@/lib/utils';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';

const GenerationPage: React.FC<{ params: { storeId: string } }> = ({ params }) => {
    const [monthlyOutput, setMonthlyOutput] = useState<string | null>(null);
    const [store, setStore] = useState(null);
    const [solarCredits, setSolarCredits] = useState<string>("");

    useEffect(() => {
        const fetchSolarOutput = async () => {

        const response = await fetch(`/api/stores/${params.storeId}`);
        const store = await response.json();

        setStore(store);

        setSolarCredits(store.solar_credits);

        const inputData = {
            lat: store?.latitude,  
            lon: store?.longitude,  
            system_capacity: store?.systemCapacity,  
            azimuth: store?.azimuth,  
            tilt: store?.tilt,  
            array_type: store?.array_type,  
            module_type: store?.module_type, 
            losses: store?.losses  
          };

        try {
            const data = await getSolarOutput(inputData);
            setMonthlyOutput(data.outputs.ac_monthly);
        } catch (error) {
            console.error('Failed to fetch data:');
        }
    }

    fetchSolarOutput();
    }, [params.storeId])

    const data = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
        datasets: [
            {
                label: 'Solar Output (Monthly)',
                data: monthlyOutput,
                fill: false,
                backgroundColor: 'rgb(75, 192, 192)',
                borderColor: 'rgba(75, 192, 192, 0.2)',
            },
        ],
    };

    const options = {
        scales: {
            x: { 
                type: 'category',
                beginAtZero: true,
            },
            y: { 
                type: 'linear', 
                beginAtZero: true,
            }
        }, tooltips: {
            enabled: true,  // this is default
            mode: 'index',  // can be 'point', 'index', 'nearest', etc.
            intersect: false,  // if true, it will show tooltips when the pointer is over the item, otherwise it will show tooltips no matter where you are in the graph area.
            backgroundColor: 'rgba(0, 0, 0, 0.8)',  // background color of the tooltip
            titleFontColor: '#fff',
            bodyFontColor: '#fff',
            borderColor: '#ddd',
            borderWidth: 1,
            // You can add more custom settings here.
        }, 
        plugins: {
            title: {
                display: true,
                text: 'Monthly Solar Energy Production (kWhac)',
                font: {
                    size: 24  // You can adjust this value for the font size.
                },
                padding: {
                    top: 10,
                    bottom: 30
                }
            }
        }
    } as any;

    console.log(solarCredits);
    
    if (!store) {
        return (
            <div>Store not found!</div>
        )
    }
    
    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8 pt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between">
                    <Heading 
                    title="Solar Energy Generation"
                    description="View your solar system's generation data"
                    />
                </div>
    
                <div className="flex flex-col items-center justify-center min-h-screen p-2 sm:p-4 lg:p-8 bg-background text-foreground transition-all duration-300">
                    <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-2xl space-y-6 bg-card rounded-xl shadow-2xl border border-primary transition-all duration-300">
                        <div className="text-center p-4 sm:p-6 lg:p-8 bg-popover rounded-lg shadow-md transition-all duration-300">
                            <h3 className="text-xl sm:text-2xl mb-2 text-secondary-foreground opacity-75">Current month:</h3>
                            <p className="text-lg sm:text-xl mb-2 text-secondary-foreground"><CurrentMonthDisplay /></p>
                            <p className="text-lg sm:text-xl">
                                Solar credits available for sale: 
                                <span className="font-semibold text-accent-foreground"> {Math.floor(parseFloat(solarCredits))}</span>
                            </p>
                        </div>
        
                        {monthlyOutput && (
                            <div className="bg-card rounded-lg shadow-md transition-all duration-300">
                                <div className="p-4">
                                    <Line data={data} options={options} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
    
};

export default GenerationPage;