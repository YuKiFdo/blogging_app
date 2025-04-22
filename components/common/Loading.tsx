import { motion } from 'framer-motion';

const LoadingSpinner = () => (
  <motion.div
    className="flex justify-center items-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-primary border-solid"></div>
  </motion.div>
);

const LoadingText = () => (
  <motion.div
    className="flex justify-center items-center space-x-2"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5, delay: 0.3 }}
  >
    <motion.div
      className="w-2 h-2 bg-primary rounded-full animate-bounce"
      initial={{ y: 0 }}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, repeatType: 'loop' }}
    />
    <motion.div
      className="w-2 h-2 bg-primary rounded-full animate-bounce200"
      initial={{ y: 0 }}
      animate={{ y: [0, -8, 0] }}
      transition={{
        duration: 0.6,
        repeat: Infinity,
        repeatType: 'loop',
        delay: 0.1,
      }}
    />
    <motion.div
      className="w-2 h-2 bg-primary rounded-full animate-bounce400"
      initial={{ y: 0 }}
      animate={{ y: [0, -8, 0] }}
      transition={{
        duration: 0.6,
        repeat: Infinity,
        repeatType: 'loop',
        delay: 0.2,
      }}
    />
  </motion.div>
);

interface LoadingProps {
  justify?: 'start' | 'center' | 'end'; 
  padding?: string; 
  margin?: string;
}

export const Loading = ({
  justify = 'center',
  padding = '',
  margin = '',
}: LoadingProps) => {
  const justifyClass = `justify-${justify}`;

  const paddingClass = justify === 'start' || justify === 'end' ? padding : '';
  const marginClass = justify === 'start' || justify === 'end' ? margin : '';

  return (
    <motion.div
      className={`min-h-screen flex flex-col ${justifyClass} items-center space-y-4 mt-0 md:mt-20 ${paddingClass} ${marginClass}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <LoadingSpinner />
      <motion.span
        className="text-lg text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        Loading...
      </motion.span>
      <LoadingText />
    </motion.div>
  );
};
