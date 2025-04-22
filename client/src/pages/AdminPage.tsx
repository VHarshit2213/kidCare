import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

type SafeUser = Omit<User, "password">;

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("parents");

  // Check if the user is authenticated and has admin privileges
  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (user.username !== "admin") {
    return (
      <Layout>
        <div className="container mx-auto py-10 text-center">
          <h1 className="text-2xl font-bold mb-4">Unauthorized Access</h1>
          <p>You do not have permission to access the admin panel.</p>
        </div>
      </Layout>
    );
  }

  // Fetch all users
  const { data: users = [], isLoading } = useQuery<SafeUser[]>({
    queryKey: ["/api/admin/users"],
  });

  // Filter users by type
  const parents = users.filter((user) => user.userType === "parent");
  const babysitters = users.filter((user) => user.userType === "babysitter");

  const renderUserTable = (userList: SafeUser[]) => {
    return (
      <Table>
        <TableCaption>List of {activeTab}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Full Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Profile Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No {activeTab} found
              </TableCell>
            </TableRow>
          ) : (
            userList.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.profileCompleted ? "success" : "outline"}>
                    {user.profileCompleted ? "Complete" : "Incomplete"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>
              Manage user accounts and view system data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center my-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="parents">
                    Parents ({parents.length})
                  </TabsTrigger>
                  <TabsTrigger value="babysitters">
                    Caregivers ({babysitters.length})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="parents" className="mt-6">
                  <h2 className="text-xl font-semibold mb-4">Parent Profiles</h2>
                  {renderUserTable(parents)}
                </TabsContent>
                <TabsContent value="babysitters" className="mt-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Caregiver Profiles
                  </h2>
                  {renderUserTable(babysitters)}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}