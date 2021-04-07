import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import useCachedResources from "./src/hooks/useCachedResources";
import { AppLoading } from "expo";

import useColorScheme from "./src/hooks/useColorScheme";
import Navigation from "./src/navigation";
import { Provider } from "mobx-react";

import { getNavigationState } from "./src/utils/PersistState";
import SyncStorage from 'sync-storage';

import Expo from "expo";

import stores from "./src/stores/index";
import { StyleProvider } from "native-base";
import { actionFieldDecorator } from "mobx/lib/internal";

export default function App() {
    const colorScheme = useColorScheme();

    const [storageLoaded, setStorageLoaded] = React.useState(false);
    //const [fontReady, setFontReady] = React.useState<boolean>(false);
 
    React.useEffect(() => {
        const storageLoad = async () => {
            await SyncStorage.init();
            setStorageLoaded(true);
        };
        storageLoad();
    }, []);

    //const isLoadingComplete = useCachedResources();
    //if (!isLoadingComplete || !routeName) {
    //    return <AppLoading />;
    //}

    return (
        <Provider {...stores}>
            <SafeAreaProvider>
                <Navigation />
                <StatusBar />
            </SafeAreaProvider>
        </Provider>
    );
}
