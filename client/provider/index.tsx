
import {NextIntlClientProvider} from 'next-intl';

export const RootLayout = ({children} : {children: React.ReactNode}) => {
    return (
        <NextIntlClientProvider>
            {children}
        </NextIntlClientProvider>
    )
}