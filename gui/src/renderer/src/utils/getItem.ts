export function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  onClick?: () => void
): MenuItem {
  return {
    key,
    icon,
    label,
    onClick
  } as MenuItem
}
