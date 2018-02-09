<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Times table</title>
</head>
<body>
<?php
// output the Times table
$size = 9;
echo '<pre>';
for ($row = 1; $row <= $size; ++$row) {
   for ($col = 1; $col <= $size; ++$col) {
      printf('%3d', $row * $col);
   }
   echo '<br>';
}
echo '</pre>'
?>
</body>
</html>