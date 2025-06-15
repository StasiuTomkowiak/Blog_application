package com.stasiu.blog.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Pozwól na wszystkie pochodzenia (dla developmentu)
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        
        // Pozwól na wszystkie metody HTTP
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // Pozwól na wszystkie nagłówki
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // Pozwól na credentials
        configuration.setAllowCredentials(true);
        
        // Zarejestruj konfigurację dla wszystkich ścieżek
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}