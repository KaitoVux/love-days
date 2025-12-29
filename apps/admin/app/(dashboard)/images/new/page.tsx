import { ImageForm } from "@/components/images/image-form";

export default function NewImagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Upload Image</h1>
        <p className="text-muted-foreground">Add a new image to your gallery</p>
      </div>

      <ImageForm mode="create" />
    </div>
  );
}
