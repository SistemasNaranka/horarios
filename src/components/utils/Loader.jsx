import styles from './styles/loader.module.css';

/**
 *
 * @param {Object} props
 * @param {String} props.size
 * @param {String} props.color
 * @returns
 */
const Loader = ({ color = '#6EB500', size = '4rem' }) => {
	return (
		<div className={styles.loader} style={{ borderRightColor: color, width: size, height: size }} />
	);
};

export default Loader;
