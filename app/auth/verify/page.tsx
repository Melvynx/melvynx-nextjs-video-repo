import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AuthPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify your email</CardTitle>
      </CardHeader>
      <CardContent>
        <p>I just sent you an email, click on the link</p>
      </CardContent>
    </Card>
  );
}
