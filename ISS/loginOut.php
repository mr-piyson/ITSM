<?php
  include 'header.php';
  unset($_SESSION['ISStoken']);
  echo "<center><h4>Redirecting ... </h4></center>";
  echo '<meta http-equiv="refresh" content="1;url=index.php" />';
  include 'footer.php';
?>
