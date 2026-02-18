import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import React from 'react';
import { Text, TouchableOpacity, type TextProps } from 'react-native';

type Props = TextProps & { href: string; children?: React.ReactNode };

export function ExternalLink({ href, children, ...rest }: Props) {
  return (
    <TouchableOpacity
      onPress={async () => {
        await openBrowserAsync(href, {
          presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
        });
      }}
    >
      <Text {...rest}>{children}</Text>
    </TouchableOpacity>
  );
}
