"use client";
import React, { useState, useRef } from "react";
import {
  RotateCcw,
  Trash2,
  Mouse,
  CircleDot,
  RectangleVertical,
  ArrowDown,
  FileText,
  Home,
  ArrowUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavigationToolbar } from "@/app/nav-menu";

interface Stats {
  leftClicks: number;
  rightClicks: number;
  middleClicks: number;
  scrollEvents: number;
}

interface LogEntry {
  timestamp: string;
  message: string;
  color: string;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  color: string;
}

export default function MouseTestingApp() {
  const [stats, setStats] = useState<Stats>({
    leftClicks: 0,
    rightClicks: 0,
    middleClicks: 0,
    scrollEvents: 0,
  });

  const [lastClickType, setLastClickType] = useState<string>("None");
  const [lastClickPos, setLastClickPos] = useState<string>("-");
  const [scrollDirection, setScrollDirection] = useState<string>("-");
  const [lastScrollDelta, setLastScrollDelta] = useState<string>("-");
  const [scrollPos, setScrollPos] = useState<string>("0px");
  const [eventLog, setEventLog] = useState<LogEntry[]>([
    {
      timestamp: new Date().toLocaleTimeString(),
      message: "Mouse testing app initialized. Start testing!",
      color: "text-green-600",
    },
  ]);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const scrollZoneRef = useRef<HTMLDivElement>(null);
  const rippleIdRef = useRef(0);

  const addToLog = (message: string, color: string = "text-foreground") => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLog((prev) =>
      [{ timestamp, message, color }, ...prev].slice(0, 50)
    );
  };

  const createRipple = (x: number, y: number, color: string) => {
    const id = rippleIdRef.current++;
    setRipples((prev) => [...prev, { id, x, y, color }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let clickType: string;
    let color: string;
    let colorClass: string;

    switch (e.button) {
      case 0:
        setStats((prev) => ({ ...prev, leftClicks: prev.leftClicks + 1 }));
        clickType = "Left Click";
        color = "#3b82f6";
        colorClass = "text-blue-600";
        break;
      case 1:
        setStats((prev) => ({ ...prev, middleClicks: prev.middleClicks + 1 }));
        clickType = "Middle Click";
        color = "#10b981";
        colorClass = "text-green-600";
        break;
      case 2:
        setStats((prev) => ({ ...prev, rightClicks: prev.rightClicks + 1 }));
        clickType = "Right Click";
        color = "#a855f7";
        colorClass = "text-purple-600";
        break;
      default:
        return;
    }

    setLastClickType(clickType);
    setLastClickPos(`(${Math.round(x)}, ${Math.round(y)})`);
    addToLog(
      `${clickType} detected at position (${Math.round(x)}, ${Math.round(y)})`,
      colorClass
    );
    createRipple(x, y, color);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    setStats((prev) => ({ ...prev, scrollEvents: prev.scrollEvents + 1 }));

    const direction = e.deltaY > 0 ? "Down ↓" : "Up ↑";
    const delta = Math.abs(Math.round(e.deltaY));

    setScrollDirection(direction);
    setLastScrollDelta(`${delta}px`);

    if (scrollZoneRef.current) {
      setScrollPos(`${Math.round(scrollZoneRef.current.scrollTop)}px`);
    }

    addToLog(`Scroll ${direction} - Delta: ${delta}px`, "text-orange-600");
  };

  const handleScroll = () => {
    if (scrollZoneRef.current) {
      setScrollPos(`${Math.round(scrollZoneRef.current.scrollTop)}px`);
    }
  };

  const clearLog = () => {
    setEventLog([]);
    setTimeout(() => {
      addToLog("Log cleared by user", "text-muted-foreground");
    }, 10);
  };

  const resetAll = () => {
    setStats({
      leftClicks: 0,
      rightClicks: 0,
      middleClicks: 0,
      scrollEvents: 0,
    });
    setLastClickType("None");
    setLastClickPos("-");
    setScrollDirection("-");
    setLastScrollDelta("-");
    setScrollPos("0px");
    if (scrollZoneRef.current) {
      scrollZoneRef.current.scrollTop = 0;
    }
    setEventLog([]);
    setTimeout(() => {
      addToLog("All statistics reset", "text-red-600");
    }, 10);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <NavigationToolbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover:-translate-y-0.5 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Left Clicks
              </CardTitle>
              <Mouse className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.leftClicks}</div>
            </CardContent>
          </Card>

          <Card className="hover:-translate-y-0.5 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Right Clicks
              </CardTitle>
              <RectangleVertical className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.rightClicks}</div>
            </CardContent>
          </Card>

          <Card className="hover:-translate-y-0.5 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Middle Clicks
              </CardTitle>
              <CircleDot className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.middleClicks}</div>
            </CardContent>
          </Card>

          <Card className="hover:-translate-y-0.5 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Scroll Events
              </CardTitle>
              <ArrowDown className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.scrollEvents}</div>
            </CardContent>
          </Card>
        </div>

        {/* Testing Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Click Testing Zone */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                <CardTitle>Click Testing Zone</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="relative rounded-md border-2 border-dashed h-64 flex items-center justify-center cursor-pointer transition-colors overflow-hidden"
                onMouseDown={handleMouseDown}
                onContextMenu={(e) => e.preventDefault()}
              >
                <div className="text-center text-muted-foreground z-10 pointer-events-none">
                  <p className="font-medium mb-1">
                    Click anywhere in this area
                  </p>
                  <p className="text-sm">Try left, right, or middle click</p>
                </div>
                {ripples.map((ripple) => (
                  <div
                    key={ripple.id}
                    className="absolute rounded-full pointer-events-none animate-ping"
                    style={{
                      left: ripple.x,
                      top: ripple.y,
                      width: "20px",
                      height: "20px",
                      backgroundColor: ripple.color,
                      opacity: 0.6,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Last Click:</span>
                  <span className="ml-2 font-medium">{lastClickType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Position:</span>
                  <span className="ml-2 font-medium">{lastClickPos}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scroll Testing Zone */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ArrowUp className="h-5 w-5 text-primary" />
                <CardTitle>Scroll Testing Zone</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                ref={scrollZoneRef}
                className="rounded-md border-2 border-dashed h-64 overflow-y-auto transition-colors p-4 space-y-3"
                onWheel={handleWheel}
                onScroll={handleScroll}
              >
                <p className="text-sm text-muted-foreground font-medium">
                  Scroll inside this area to test your mouse wheel
                </p>
                <div className="rounded-md border p-3 space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Direction:</span>
                    <span className="ml-2 font-medium">{scrollDirection}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Delta:</span>
                    <span className="ml-2 font-medium">{lastScrollDelta}</span>
                  </div>
                </div>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-32 rounded-md bg-muted border flex items-center justify-center"
                  >
                    <p className="text-sm text-muted-foreground">
                      Scroll content area {i}
                    </p>
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Scroll Position:</span>
                <span className="ml-2 font-medium">{scrollPos}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
