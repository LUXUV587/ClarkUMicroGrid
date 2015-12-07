<?php
    require_once 'login.php';
    $conn = new mysqli($hn, $un, $pw, $db);
    if ($conn->connect_error) die($conn->connect_error);
    $query = "SELECT date(min(date_time)) as start_date,date(max(date_time)) as end_date FROM monitoring_data";
    $result = $conn->query($query);
    if (!$result) die($conn->error);
    $rows = $result->num_rows;
    $tabledata = array();
    for ($j = 0 ; $j < $rows ; ++$j)
    {
    $result->data_seek($j);
    $row = $result->fetch_array(MYSQLI_ASSOC);
    $tabledata[] = $row;
    }
    echo json_encode($tabledata);

    $result->close();
    $conn->close();
?>