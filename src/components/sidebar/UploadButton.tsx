import { type ChangeEvent } from 'react';

interface Props {
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const UploadButton = ({ onUpload }: Props) => (
  <label className="block cursor-pointer">
    <input
      type="file"
      accept=".shp,.geojson,.kml,.zip"
      onChange={onUpload}
      className="hidden"
    />
    <div className="w-full px-4 py-4 bg-orange-50 border-2 border-orange-200 rounded-xl flex items-center gap-3">
      <img src="/doc.png" alt="upload" className="w-6 h-6" />
      <span className="text-gray-700">Uploading a shape file</span>
    </div>
  </label>
);