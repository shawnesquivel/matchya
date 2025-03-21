def main(html_in_string_format, params):
    """
    Uses BS4 to scrape JaneApp links and image URLs from HTML content.

    Args:
        html_in_string_format (str): HTML content as a string
        params (dict): Additional parameters (not used in current implementation)
        
    Returns:
        str: Formatted string containing extracted links and image URLs

    Test:
        test_html = '''
        <a href="https://janeapp.com/booking/12345">Book Now</a>
        <img src="https://example.com/image.jpg" alt="Example">
        <a href="https://example.com">Regular Link</a>
        '''
        result = main(test_html, {})
        print(result)   
        # Expected output:
        # JaneApp HREF Tags:
        # https://janeapp.com/booking/12345
        #
        # IMG Tags:
        # https://example.com/image.jpg

    Notes:
        Uses BeautifulSoup for slower parsing which is more robust for complex HTML
        than regex-based parsing.
    """
    from bs4 import BeautifulSoup

    # Create BeautifulSoup object to parse HTML
    soup = BeautifulSoup(html_in_string_format, 'html.parser')
    
    # Find all a tags with href attributes containing "janeapp"
    a_tags = soup.find_all('a', href=True)
    href_list = []
    print("JaneApp links found:")
    for a in a_tags:
        href = a.get('href')
        if href and "janeapp" in href.lower():  # Filter for janeapp links only
            print(href)
            href_list.append(href)

    # Find all img tags
    img_tags = soup.find_all('img')
    img_list = []
    print("\nImages found:")
    for img in img_tags:
        src = img.get('src')
        if src:
            print(src)
            img_list.append(src)

    # Combine all tags into a single string
    all_tags = ""
    
    # Add janeapp href tags
    if href_list:
        all_tags += "JaneApp HREF Tags:\n"
        all_tags += "\n".join(href_list)
        all_tags += "\n\n"
        
    # Add img tags    
    if img_list:
        all_tags += "IMG Tags:\n"
        all_tags += "\n".join(img_list)
        
    # If no tags were found, indicate that
    if not href_list and not img_list:
        all_tags = "No JaneApp links or IMG tags found in the HTML"
    
    img_and_link_tags_as_str = all_tags
    return img_and_link_tags_as_str