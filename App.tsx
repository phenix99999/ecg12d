import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import useCachedResources from "./src/hooks/useCachedResources";
import { AppLoading } from "expo";

import useColorScheme from "./src/hooks/useColorScheme";
import Navigation from "./src/navigation";
import { Provider } from "mobx-react";

import { getNavigationState } from "./src/utils/PersistState";

import Expo from "expo";

import stores from "./src/stores/index";
import { StyleProvider } from "native-base";

export default function App() {
    const colorScheme = useColorScheme();

    const [routeName, setRouteName] = React.useState<"Login" | "Logout">("Logout");
    //const [fontReady, setFontReady] = React.useState<boolean>(false);
    global.fmServer = "vhmsoft.com";
    global.fmDatabase = "vhmsoft";
    
    React.useEffect(() => {
        const getRouteName = async () => {
            const routeName = await getNavigationState();
            setRouteName(routeName);
        };
        getRouteName();
    }, []);

    //const isLoadingComplete = useCachedResources();
    //if (!isLoadingComplete || !routeName) {
    //    return <AppLoading />;
    //}

    return (
        <Provider {...stores}>
            <SafeAreaProvider>
                <Navigation colorScheme={colorScheme} initialRouteName={routeName} />
                <StatusBar />
            </SafeAreaProvider>
        </Provider>
    );
}
