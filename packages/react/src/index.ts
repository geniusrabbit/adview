import AdViewProvider from './AdViewUnit/AdViewProvider';
import AdViewUnitClient from './AdViewUnit/AdViewUnit.client';
import AdViewUnitBannerTemplate from './AdViewUnit/AdViewUnitBannerTemplate';
import AdViewUnitDefaultTemplate from './AdViewUnit/AdViewUnitDefaultTemplate';
import AdViewUnitNativeTemplate from './AdViewUnit/AdViewUnitNativeTemplate';
import AdViewUnitProxyTemplate from './AdViewUnit/AdViewUnitProxyTemplate';
import AdViewUnitTemplate from './AdViewUnit/AdViewUnitTemplate';
import {
  AdViewOptionalDataProps,
  AdViewUnitClientChildren,
  AdViewUnitTemplateProps,
  AdViewUnitTemplateTypeProps,
} from './types';

export {
  AdViewOptionalDataProps,
  AdViewProvider,
  AdViewUnitBannerTemplate,
  AdViewUnitClient,
  AdViewUnitClientChildren,
  AdViewUnitDefaultTemplate,
  AdViewUnitNativeTemplate,
  AdViewUnitProxyTemplate,
  AdViewUnitTemplate,
  AdViewUnitTemplateProps,
  AdViewUnitTemplateTypeProps,

  /**
   * Components renamed for easier imports
   */
  AdViewUnitBannerTemplate as BannerTemplate,
  AdViewUnitDefaultTemplate as DefaultTemplate,
  AdViewUnitNativeTemplate as NativeTemplate,
  AdViewProvider as Provider,
  AdViewUnitProxyTemplate as ProxyTemplate,
  AdViewUnitTemplate as Template,
  AdViewUnitClient as Unit
};

