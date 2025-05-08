import FileUploadMultiFile from "@/components/file-upload-multi-file";

export default async function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <FileUploadMultiFile />
    </div>
  );
}
