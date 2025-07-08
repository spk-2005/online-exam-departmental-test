import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import Instruction from './instructions';

export default function Test1() {
  const router = useRouter();
  const { group, test } = router.query;

  useEffect(() => {
    if (group && test) {
      console.log("Test Starting:", group, test);
      // here you can call an API to mark 'attempt started'
      // or fetch test questions etc.
    }
  }, [group, test]);


  return (

<>
<Instruction/>
</>
  );
}
