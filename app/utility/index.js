import { Platform } from 'react-native';
import {
  copyFileAssets,
  exists,
  ExternalCachesDirectoryPath,
  MainBundlePath,
} from 'react-native-fs';

export const objectToItems = (object: any) => {
  return Object.keys(object).map((value) => {
    return {
      label: value,
      value: object[value],
    };
  });
};

export const arrayToItems = (array: any[]) => {
  return array.map((value) => {
    return {
      label: value.toString(),
      value: value,
    };
  });
};

export const enumToItems = (enumType: any) => {
  const items = Object.values(enumType);
  const keys = items.filter((v) => typeof v === 'string');
  const values = items.filter((v) => typeof v === 'number');
  return keys.map((value, index) => ({
    label: value,
    value: values[index],
  }));
};

export function getAssetPath(fileName: string): string {
  if (Platform.OS === 'android') {
    return `/assets/${fileName}`;
  }
  return `${MainBundlePath}/${fileName}`;
}

export async function getAbsolutePath(filePath: string): Promise<string> {
  if (Platform.OS === 'android') {
    if (filePath.startsWith('/assets/')) {
      // const fileName = filePath;
      const fileName = filePath.replace('/assets/', '');
      const destPath = `${ExternalCachesDirectoryPath}/${fileName}`;
      if (!(await exists(destPath))) {
        await copyFileAssets(fileName, destPath);
      }
      return destPath;
    }
  }
  return filePath;
}