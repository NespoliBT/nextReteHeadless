// import ClassName from 'models/classname';
// import styles from './NavListItem.module.scss';
import Link from 'next/link';

const NavListItem = ({ className, item }) => {
  const nestedItems = (item.children || []).map((item) => {
    return <NavListItem key={item.id} item={item} />;
  });

  console.log(className, item);

  return (
    <li key={item.id} className={className}>
      <Link href={item.path}>
        <a title={item.title}>{item.label}</a>
      </Link>
    </li>
  );
};

export default NavListItem;
