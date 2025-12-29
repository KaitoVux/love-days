import { Music, Image, Heart, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const stats = [
    { name: "Total Songs", value: "12", icon: Music, color: "text-blue-500" },
    { name: "Total Images", value: "48", icon: Image, color: "text-green-500" },
    { name: "Days Together", value: "365", icon: Heart, color: "text-primary" },
  ];

  const quickActions = [
    { name: "Upload Song", href: "/dashboard/songs", icon: Music },
    { name: "Upload Image", href: "/dashboard/images", icon: Image },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Love Days Admin</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {quickActions.map((action) => (
            <Link key={action.name} href={action.href}>
              <Button variant="outline" className="h-20 w-full">
                <div className="flex flex-col items-center gap-2">
                  <action.icon className="h-6 w-6" />
                  <span>{action.name}</span>
                </div>
              </Button>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm">
                  Uploaded new song: &ldquo;Our Song.mp3&rdquo;
                </p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm">Uploaded 5 new images</p>
                <p className="text-xs text-muted-foreground">5 hours ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
