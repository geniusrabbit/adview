import AdViewUnitServer from './AdViewUnit/AdViewUnit.server';
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
  AdViewUnitBannerTemplate,
  AdViewUnitClientChildren,
  AdViewUnitDefaultTemplate,
  AdViewUnitNativeTemplate,
  AdViewUnitProxyTemplate,
  AdViewUnitServer,
  AdViewUnitTemplate,
  AdViewUnitTemplateProps,
  AdViewUnitTemplateTypeProps,

  /**
   * Components renamed for easier imports
   */
  AdViewUnitBannerTemplate as BannerTemplate,
  AdViewUnitDefaultTemplate as DefaultTemplate,
  AdViewUnitNativeTemplate as NativeTemplate,
  AdViewUnitProxyTemplate as ProxyTemplate,
  AdViewUnitTemplate as Template,
  AdViewUnitServer as Unit
};

