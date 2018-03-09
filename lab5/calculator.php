<html>
<body>
<?php
$a = $_REQUEST["a"];
$b = $_REQUEST["b"];

include "connectdb.php";

echo "Your first input was: " . $a . "<br>";
echo "Your second input was: " . $b . "<br>";

echo "Addition Result: " . ($a + $b) . "<br>";
echo "Deduction Result: " . ($a - $b) . "<br>";
echo "Multiplication Result: " . ($a * $b) . "<br>";
echo "Division Result: " . ($a / $b) . "<br>";


?>
</body>
</html>




