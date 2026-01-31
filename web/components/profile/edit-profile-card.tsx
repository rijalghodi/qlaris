"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod/v3";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageInput } from "@/components/ui/image-input";

import { useEditCurrentUser } from "@/services/api-user";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.string().optional(),
  imageUrl: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function EditProfileCard({
  user,
  readOnly = false,
}: {
  user: ProfileFormData;
  readOnly?: boolean;
}) {
  const { mutate: updateProfile, isPending } = useEditCurrentUser({
    onSuccess: (data) => {
      toast.success("Profile updated successfully");
      const user = data.data;
      form.reset({
        name: user?.name || "",
        image: user?.image?.key || "",
        imageUrl: user?.image?.url || "",
      });
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      image: user.imageUrl || "",
      imageUrl: user.imageUrl || "",
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfile({
      name: data.name,
      image: data.image || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your personal details.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Picture</FormLabel>
                  <FormControl>
                    <ImageInput
                      {...field}
                      defaultValueUrl={user.imageUrl}
                      folder="users"
                      className="rounded-full w-24 h-24 sm:w-28 sm:h-28"
                      readOnly={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} readOnly={readOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!readOnly && (
              <div className="flex justify-end">
                <Button type="submit" disabled={!form.formState.isDirty || isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
