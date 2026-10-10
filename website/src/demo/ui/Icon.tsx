// Phosphor icons, the same set the desktop app uses. Only the icons listed here end up in the bundle.
import x from '@phosphor-icons/core/regular/x.svg?raw';
import plus from '@phosphor-icons/core/regular/plus.svg?raw';
import magnifyingGlass from '@phosphor-icons/core/regular/magnifying-glass.svg?raw';
import slidersHorizontal from '@phosphor-icons/core/regular/sliders-horizontal.svg?raw';
import trash from '@phosphor-icons/core/regular/trash.svg?raw';
import xCircle from '@phosphor-icons/core/regular/x-circle.svg?raw';
import copy from '@phosphor-icons/core/regular/copy.svg?raw';
import chartBarHorizontal from '@phosphor-icons/core/regular/chart-bar-horizontal.svg?raw';
import wifiHigh from '@phosphor-icons/core/regular/wifi-high.svg?raw';
import fileText from '@phosphor-icons/core/regular/file-text.svg?raw';
import database from '@phosphor-icons/core/regular/database.svg?raw';
import folder from '@phosphor-icons/core/regular/folder.svg?raw';
import folderOpen from '@phosphor-icons/core/regular/folder-open.svg?raw';
import file from '@phosphor-icons/core/regular/file.svg?raw';
import fileImage from '@phosphor-icons/core/regular/file-image.svg?raw';
import filePdf from '@phosphor-icons/core/regular/file-pdf.svg?raw';
import arrowUp from '@phosphor-icons/core/regular/arrow-up.svg?raw';
import arrowDownLeft from '@phosphor-icons/core/regular/arrow-down-left.svg?raw';
import arrowUpRight from '@phosphor-icons/core/regular/arrow-up-right.svg?raw';
import exportIcon from '@phosphor-icons/core/regular/export.svg?raw';
import deviceMobile from '@phosphor-icons/core/regular/device-mobile.svg?raw';
import gear from '@phosphor-icons/core/regular/gear.svg?raw';
import caretRight from '@phosphor-icons/core/regular/caret-right.svg?raw';
import caretDown from '@phosphor-icons/core/regular/caret-down.svg?raw';
import arrowClockwise from '@phosphor-icons/core/regular/arrow-clockwise.svg?raw';
import pencilSimple from '@phosphor-icons/core/regular/pencil-simple.svg?raw';
import check from '@phosphor-icons/core/regular/check.svg?raw';
import warning from '@phosphor-icons/core/regular/warning.svg?raw';
import androidLogo from '@phosphor-icons/core/regular/android-logo.svg?raw';
import appleLogo from '@phosphor-icons/core/regular/apple-logo.svg?raw';
import desktop from '@phosphor-icons/core/regular/desktop.svg?raw';
import pause from '@phosphor-icons/core/regular/pause.svg?raw';
import play from '@phosphor-icons/core/regular/play.svg?raw';
import minus from '@phosphor-icons/core/regular/minus.svg?raw';
import image from '@phosphor-icons/core/regular/image.svg?raw';
import arrowLeft from '@phosphor-icons/core/regular/arrow-left.svg?raw';
import info from '@phosphor-icons/core/regular/info.svg?raw';
import command from '@phosphor-icons/core/regular/command.svg?raw';
import graph from '@phosphor-icons/core/regular/graph.svg?raw';
import listBullets from '@phosphor-icons/core/regular/list-bullets.svg?raw';
import broadcast from '@phosphor-icons/core/regular/broadcast.svg?raw';
import lockSimple from '@phosphor-icons/core/regular/lock-simple.svg?raw';
import sparkle from '@phosphor-icons/core/regular/sparkle.svg?raw';

const icons = {
  'x': x,
  'plus': plus,
  'magnifying-glass': magnifyingGlass,
  'sliders-horizontal': slidersHorizontal,
  'trash': trash,
  'x-circle': xCircle,
  'copy': copy,
  'chart-bar-horizontal': chartBarHorizontal,
  'wifi-high': wifiHigh,
  'file-text': fileText,
  'database': database,
  'folder': folder,
  'folder-open': folderOpen,
  'file': file,
  'file-image': fileImage,
  'file-pdf': filePdf,
  'arrow-up': arrowUp,
  'arrow-down-left': arrowDownLeft,
  'arrow-up-right': arrowUpRight,
  'export': exportIcon,
  'device-mobile': deviceMobile,
  'gear': gear,
  'caret-right': caretRight,
  'caret-down': caretDown,
  'arrow-clockwise': arrowClockwise,
  'pencil-simple': pencilSimple,
  'check': check,
  'warning': warning,
  'android-logo': androidLogo,
  'apple-logo': appleLogo,
  'desktop': desktop,
  'pause': pause,
  'play': play,
  'minus': minus,
  'image': image,
  'arrow-left': arrowLeft,
  'info': info,
  'command': command,
  'graph': graph,
  'list-bullets': listBullets,
  'broadcast': broadcast,
  'lock-simple': lockSimple,
  'sparkle': sparkle,
};

export type IconName = keyof typeof icons;

interface IconProps {
  name: IconName;
  size?: number;
  class?: string;
}

export function Icon({ name, size = 14, class: className }: IconProps) {
  return (
    <span
      class={`xr-icon ${className ?? ''}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: icons[name] }}
    />
  );
}
