import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ROUTES } from "@/lib/routes";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <Empty>
        <EmptyMedia variant="icon" className="bg-muted">
          <FileQuestion className="text-muted-foreground size-6" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Page Not Found</EmptyTitle>
          <EmptyDescription>
            The page you are looking for does not exist or has been moved.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href={ROUTES.DASHBOARD}>Back to Home</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
