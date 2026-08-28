<?php

/**
 * Load HTML Purifier without loading a second copy when another plugin has
 * already registered it.
 */
if (!class_exists('HTMLPurifier')) {
    require_once __DIR__ . '/HTMLPurifier/HTMLPurifier.auto.php';
}
