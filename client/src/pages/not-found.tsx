import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/20">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="mb-6">
            <img src="/images/enchanted-logo.jpg" alt="The Enchanted Co." className="h-20 w-20 rounded-full mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Oops! Page Not Found</h1>
            <p className="text-lg text-gray-600">
              We couldn't find the page you were looking for.
            </p>
          </div>
          
          <Link href="/">
            <Button className="mx-auto mt-4 flex items-center gap-2 px-6">
              <HomeIcon className="h-4 w-4" />
              Return Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
