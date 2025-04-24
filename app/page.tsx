import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted">
      <div className="max-w-4xl w-full space-y-12 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            NextFullstack
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Application to learn using Next.js as a Fullstack Framework. Build
            eaasy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Modern Stack</CardTitle>
              <CardDescription>
                Built with the latest technologies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Leverage the power of Next.js, React, Prisma, and Tailwind CSS
                to build full-stack applications quickly.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/docs">Learn More</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Full-Stack</CardTitle>
              <CardDescription>
                Frontend and backend in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Write your UI components and API routes in the same codebase,
                simplifying your development workflow.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/examples">View Examples</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Easy Deployment</CardTitle>
              <CardDescription>Ship with confidence</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Deploy your application with a single command to Vercel or any
                other hosting platform of your choice.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/deploy">Deploy Now</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="pt-8">
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle>Get Started Today</CardTitle>
              <CardDescription>
                Join our community of developers
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/avatars/01.png" alt="User" />
                <AvatarFallback>U1</AvatarFallback>
              </Avatar>
              <Avatar className="h-12 w-12">
                <AvatarImage src="/avatars/02.png" alt="User" />
                <AvatarFallback>U2</AvatarFallback>
              </Avatar>
              <Avatar className="h-12 w-12">
                <AvatarImage src="/avatars/03.png" alt="User" />
                <AvatarFallback>U3</AvatarFallback>
              </Avatar>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button size="lg" className="px-8">
                Start Building
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
