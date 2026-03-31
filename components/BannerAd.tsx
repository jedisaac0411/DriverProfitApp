import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BannerAd as AdMobBanner, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';


const adUnitId = 'ca-app-pub-3940256099942544/9214589741';

interface BannerAdProps {
  position?: 'top' | 'bottom';
  marginTop?: number;
  marginBottom?: number;
}

export default function BannerAd({
  position = 'bottom',
  marginTop = 0,
  marginBottom = 0,
}: BannerAdProps) {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  const handleAdLoaded = () => {
    setAdLoaded(true);
    setAdError(false);
  };

  const handleAdFailedToLoad = (error: any) => {
    console.log('Ad failed to load:', error);
    setAdError(true);
    setAdLoaded(false);
  };

  // If ad failed, don't render anything
  if (adError) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        { marginTop, marginBottom },
        position === 'bottom' ? styles.bottom : styles.top,
      ]}
    >
      <AdMobBanner
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={handleAdFailedToLoad}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  top: {
    marginTop: 10,
  },
  bottom: {
    marginBottom: 10,
  },
});