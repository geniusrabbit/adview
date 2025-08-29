import { PopunderProps } from './types';
import usePopunder from './usePopunder';

function Popunder({ ...config }: PopunderProps) {
  usePopunder(config);

  return null;
}

export default Popunder;
